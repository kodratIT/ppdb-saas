# System Audit Logs - Design Document

**Created:** 2025-01-25
**Status:** Approved
**Approach:** MVP (Phase 1) → Enhancement (Phase 2) → Advanced (Phase 3)

---

## Overview

Comprehensive audit logging system untuk tracking semua aktivitas di PPDB-SAAS-V2, termasuk user actions, system events, integration calls, dan failed attempts.

---

## 1. Database Schema

### Audit Logs Table

```sql
audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NULL,              -- NULL untuk system-wide events
  user_id UUID NULL,                -- NULL untuk system events

  -- Event metadata
  action VARCHAR(50),               -- login, create, update, delete, dll
  entity_type VARCHAR(50),          -- user, tenant, application, dll
  entity_id UUID,                   -- ID dari entity yang terpengaruh

  -- Details
  details JSONB,                    -- {before: {}, after: {}, metadata: {}}
  ip_address INET,
  user_agent TEXT,

  -- Context
  severity VARCHAR(20),             -- info, warning, error, critical
  status VARCHAR(20),               -- success, failed, pending

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ           -- Untuk efficient querying
)

-- Indexes untuk performance
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_indexed ON audit_logs(indexed_at DESC);
```

### Enums

**Action:**
- LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE
- EXPORT, BULK_OPERATION, SCHEDULED_JOB
- SYSTEM_EVENT, API_CALL, FAILED_ATTEMPT

**Entity Type:**
- USER, TENANT, APPLICATION, INVOICE
- SETTING, PERMISSION, INTEGRATION, JOB

**Severity:**
- INFO, WARNING, ERROR, CRITICAL

**Status:**
- SUCCESS, FAILED, PENDING

---

## 2. UI Components & Layout

### Page Structure

```
/admin/system/audit-logs
├── Page Header
│   ├── Title: "Audit Logs"
│   ├── Description: "Track all system activities"
│   └── Actions: Export button, Real-time toggle
│
├── Filters Bar (Sticky)
│   ├── Search (by description, entity)
│   ├── Action dropdown (all actions)
│   ├── Entity Type dropdown
│   ├── Severity badge filter
│   ├── Status filter
│   ├── Date Range picker
│   ├── Tenant selector (untuk super admin)
│   └── User selector
│
├── Stats Cards (Optional, above table)
│   ├── Total logs (today/week/month)
│   ├── Failed attempts count
│   ├── Critical events
│   └── Most active user
│
└── Logs Table
    ├── Columns:
    │   ├── Timestamp (clickable untuk details)
    │   ├── User (avatar + name + role)
    │   ├── Action (badge color-coded)
    │   ├── Entity (type + ID link)
    │   ├── Details (truncated, expandable)
    │   ├── Severity (badge)
    │   ├── Status (icon)
    │   └── IP Address
    ├── Pagination (bottom)
    └── Real-time indicator (when streaming)
```

### Log Detail Modal

```
┌─────────────────────────────────────┐
│ Event Details            [Close]    │
├─────────────────────────────────────┤
│ Timestamp: 2025-01-25 10:23:45     │
│ User: John Doe (Super Admin)        │
│ Action: UPDATE (User)               │
│ Severity: INFO                      │
│ Status: SUCCESS                     │
├─────────────────────────────────────┤
│ Before:                             │
│ { "name": "Old Name", ... }         │
│                                     │
│ After:                              │
│ { "name": "New Name", ... }         │
│                                     │
│ Metadata:                           │
│ { "ip": "192.168.1.1", ... }       │
└─────────────────────────────────────┘
```

### Color Coding

- **CREATE:** Green
- **UPDATE:** Blue
- **DELETE:** Red
- **LOGIN:** Purple
- **FAILED_ATTEMPT:** Orange
- **SYSTEM_EVENT:** Gray

---

## 3. API Endpoints & Data Flow

### Server-Side Functions

```typescript
// +page.server.ts - Load audit logs dengan filters
export const load: PageServerLoad = async ({ url, locals }) => {
  const filters = {
    search: url.searchParams.get('q'),
    action: url.searchParams.get('action'),
    entityType: url.searchParams.get('entity'),
    severity: url.searchParams.get('severity'),
    status: url.searchParams.get('status'),
    userId: url.searchParams.get('userId'),
    tenantId: url.searchParams.get('tenantId'),
    dateFrom: url.searchParams.get('from'),
    dateTo: url.searchParams.get('to'),
    page: Number(url.searchParams.get('page') || '1'),
    limit: Number(url.searchParams.get('limit') || '50')
  };

  const { logs, total, stats } = await fetchAuditLogs(filters);

  return { logs, total, stats, filters };
};

// +page.server.ts - Export action
export const actions = {
  export: async ({ request, locals }) => {
    const formData = await request.formData();
    const filters = JSON.parse(formData.get('filters') as string);
    const format = formData.get('format') as 'csv' | 'xlsx';

    return await exportAuditLogs(filters, format);
  }
};
```

### Helper Functions

```typescript
// $lib/server/audit-logs.ts

// Fetch logs dengan pagination & filters
export async function fetchAuditLogs(filters: AuditLogFilters) {
  const query = db.select().from(auditLogs);

  // Apply filters dynamically
  if (filters.search) {
    query.where(or(
      ilike(auditLogs.details, `%${filters.search}%`),
      ilike(auditLogs.entityId, `%${filters.search}%`)
    ));
  }
  // ... other filters

  // Pagination
  query.limit(filters.limit).offset((filters.page - 1) * filters.limit);

  const logs = await query.orderBy(desc(auditLogs.createdAt));
  const total = await getCount(filters);

  return { logs, total };
}

// Log an event (call this from anywhere in app)
export async function logAuditEvent(data: {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  tenantId?: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  status?: 'success' | 'failed' | 'pending';
}) {
  await db.insert(auditLogs).values({
    ...data,
    ipAddress: data.ip || getClientIP(),
    userAgent: data.userAgent || getUserAgent(),
    createdAt: new Date()
  });
}
```

### Real-time Streaming (Optional, SSE)

```typescript
// +page.server.ts - SSE endpoint untuk real-time logs
export async function GET({ request }) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const newLogs = await getNewLogsSince(lastEventId);
        controller.enqueue(`data: ${JSON.stringify(newLogs)}\n\n`);
      }, 5000); // Poll every 5s

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

---

## 4. Logging Integration Points

### Authentication Events

```typescript
// $lib/server/auth/login.ts
export async function login(credentials) {
  try {
    const user = await authenticate(credentials);
    await logAuditEvent({
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      tenantId: user.tenantId,
      severity: 'info',
      status: 'success'
    });
    return user;
  } catch (e) {
    await logAuditEvent({
      action: 'FAILED_ATTEMPT',
      entityType: 'USER',
      entityId: credentials.email,
      severity: 'warning',
      status: 'failed',
      details: { reason: e.message }
    });
    throw e;
  }
}
```

### CRUD Operations

```typescript
// $lib/server/users/actions.ts
export async function updateUser(userId: string, data: UpdateUserInput) {
  const before = await getUser(userId);
  const after = await db.update(users).set(data).where(eq(users.id, userId));

  await logAuditEvent({
    action: 'UPDATE',
    entityType: 'USER',
    entityId: userId,
    userId: currentUser.id,
    tenantId: currentUser.tenantId,
    details: { before, after, changes: getDiff(before, after) },
    severity: 'info',
    status: 'success'
  });
}
```

### Integration Calls

```typescript
// $lib/server/integrations/xendit.ts
export async function createXenditInvoice(data) {
  try {
    const result = await xendit.createInvoice(data);
    await logAuditEvent({
      action: 'API_CALL',
      entityType: 'INVOICE',
      entityId: result.id,
      userId: data.userId,
      tenantId: data.tenantId,
      details: { endpoint: '/invoices', response: result.id },
      severity: 'info',
      status: 'success'
    });
    return result;
  } catch (e) {
    await logAuditEvent({
      action: 'API_CALL',
      entityType: 'INVOICE',
      entityId: data.id,
      severity: 'error',
      status: 'failed',
      details: { error: e.message }
    });
    throw e;
  }
}
```

### System Events

```typescript
// Vercel/Scheduled job handlers
export async function handleScheduledJob(jobName: string) {
  await logAuditEvent({
    action: 'SCHEDULED_JOB',
    entityType: 'JOB',
    entityId: jobName,
    severity: 'info',
    status: 'pending'
  });

  try {
    await executeJob(jobName);
    await logAuditEvent({
      action: 'SCHEDULED_JOB',
      entityType: 'JOB',
      entityId: jobName,
      severity: 'info',
      status: 'success'
    });
  } catch (e) {
    await logAuditEvent({
      action: 'SCHEDULED_JOB',
      entityType: 'JOB',
      entityId: jobName,
      severity: 'error',
      status: 'failed'
    });
  }
}
```

### Middleware untuk Auto-Logging (Optional)

```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  const startTime = Date.now();

  const response = await resolve(event);

  const duration = Date.now() - startTime;
  if (duration > 3000) { // Slow requests
    await logAuditEvent({
      action: 'SYSTEM_EVENT',
      entityType: 'REQUEST',
      entityId: event.url.pathname,
      severity: 'warning',
      status: 'success',
      details: { duration, method: event.request.method }
    });
  }

  return response;
}
```

---

## 5. Implementation Strategy

### Phase 1: Foundation (Must-have)

1. **Database schema** - Create `audit_logs` table + indexes
2. **Core helper** - `logAuditEvent()` function
3. **Basic UI** - Table view dengan pagination
4. **Filters** - Date range, action, entity type
5. **Integration** - Login/logout logging

### Phase 2: Enhancement (Nice-to-have)

1. **Advanced filters** - User, tenant, severity, status
2. **Search** - Full-text search across logs
3. **Log detail modal** - Expandable rows
4. **Export** - CSV/Excel export
5. **More logging points** - CRUD, integrations

### Phase 3: Advanced (Premium)

1. **Real-time streaming** - SSE untuk live updates
2. **Stats dashboard** - Cards dengan metrics
3. **Alerts** - Threshold-based notifications
4. **Log retention** - Auto-archive old logs
5. **Performance optimization** - Partitioning, caching

---

## Tech Stack Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| **DB** | PostgreSQL + Drizzle ORM | Already in project |
| **UI Table** | TanStack Table (Svelte) | Powerful filtering/sorting |
| **Real-time** | Server-Sent Events | Simpler than WebSocket |
| **Export** | PapaParse (CSV) + ExcelJS | Battle-tested |
| **Charts** | Recharts (Svelte) | Untuk future analytics |

---

## File Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── audit-logs/
│   │   │   ├── schema.ts      # Drizzle schema
│   │   │   ├── queries.ts     # Fetch/filter functions
│   │   │   └── logger.ts      # logAuditEvent()
│   ├── components/
│   │   └── admin/
│   │       └── audit-logs/
│   │           ├── LogsTable.svelte
│   │           ├── LogDetailModal.svelte
│   │           ├── FiltersBar.svelte
│   │           └── ExportButton.svelte
├── routes/
│   └── admin/
│       └── system/
│           └── audit-logs/
│               ├── +page.svelte
│               ├── +page.server.ts
│               └── export.ts
```

---

## Next Steps

**Ready untuk implementation planning?**

Lanjut ke pembuatan detailed implementation plan dengan `writing-plans` skill?
