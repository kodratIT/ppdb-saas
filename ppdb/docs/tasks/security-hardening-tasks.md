# 📋 TASK LIST: PAKET A (Security Essentials)

**File:** `docs/tasks/security-hardening-tasks.md`

---

## 🎯 Goal

Amankan platform dengan implementasi RLS, audit logging fix, permissions, dan input validation.

---

## 📦 DELIVERABLES SUMMARY

| No. | Task                           | Effort | Status  |
| --- | ------------------------------ | ------ | ------- |
| 1   | Fix Audit Log Transaction Bug  | 1 jam  | ⏳ Todo |
| 2   | Create RLS Migration           | 2 jam  | ⏳ Todo |
| 3   | Create Permissions Definitions | 1 jam  | ⏳ Todo |
| 4   | Add Zod Validation Schemas     | 2 jam  | ⏳ Todo |
| 5   | Add Rate Limiting              | 1 jam  | ⏳ Todo |

**Total: ~7 jam**

---

## 📝 DETAILED TASK LIST

### TASK 1: Fix Audit Log Transaction Bug ⏱️ 1 jam

**File:** `src/lib/server/domain/admin/index.ts`

**Description:**
Fix bug di `deleteTenant()` function dimana audit log ditulis di luar transaction, menyebabkan audit log orphan jika transaction gagal.

**Steps:**

1. Open `src/lib/server/domain/admin/index.ts`
2. Find `deleteTenant` function (around line 105)
3. Pindahkan `await db.insert(auditLogs).values({...})` ke dalam transaction block
4. Save file

**Code Change:**

```typescript
// BEFORE (problematic):
await db.transaction(async (tx: any) => {
  // ... deletes ...
  const [deleted] = await tx.delete(tenants).where(eq(tenants.id, tenantId)).returning();
});
// ❌ Audit log di luar tx!
await db.insert(auditLogs).values({...});

// AFTER (fixed):
await db.transaction(async (tx: any) => {
  // ... deletes ...
  const [deleted] = await tx.delete(tenants).where(eq(tenants.id, tenantId)).returning();
  // ✅ Audit log di dalam tx
  await tx.insert(auditLogs).values({
    actorId,
    action: 'delete_tenant',
    target: `tenant:${tenantId}`,
    details: JSON.stringify({ id: tenantId, name: deleted?.name })
  });
  return deleted;
});
```

**Validation:**

- [ ] Audit log sekarang dalam transaction yang sama
- [ ] Jika transaction fail, audit log tidak tersimpan

---

### TASK 2: Create RLS Migration ⏱️ 2 jam

**File:** `drizzle/migrations/0011_enable_rls.sql`

**Description:**
Create database migration untuk enable Row-Level Security pada semua tabel tenant-scoped.

**Steps:**

1. Create directory: `mkdir -p drizzle/migrations`
2. Create file: `drizzle/migrations/0011_enable_rls.sql`
3. Copy paste migration SQL
4. Run: `npm run db:push` atau `npx drizzle-kit push`

**File Content:**

```sql
-- Enable Row-Level Security pada semua tabel tenant-scoped

-- Enable RLS pada tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

-- Enable RLS pada users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Enable RLS pada units
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE units FORCE ROW LEVEL SECURITY;

-- Enable RLS pada applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications FORCE ROW LEVEL SECURITY;

-- Enable RLS pada admission_paths
ALTER TABLE admission_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_paths FORCE ROW LEVEL SECURITY;

-- Enable RLS pada fee_structures
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures FORCE ROW LEVEL SECURITY;

-- Enable RLS pada invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payment_proofs
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs FORCE ROW LEVEL SECURITY;

-- Enable RLS pada broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts FORCE ROW LEVEL SECURITY;

-- Enable RLS pada custom_fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields FORCE ROW LEVEL SECURITY;

-- Enable RLS pada application_documents
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents FORCE ROW LEVEL SECURITY;

-- Enable RLS pada sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada school_profiles
ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_profiles FORCE ROW LEVEL SECURITY;

-- Enable RLS pada tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets FORCE ROW LEVEL SECURITY;

-- Enable RLS pada ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages FORCE ROW LEVEL SECURITY;

-- Enable RLS pada payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;

-- Enable RLS pada saas_subscriptions
ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscriptions FORCE ROW LEVEL SECURITY;

-- Enable RLS pada saas_invoices
ALTER TABLE saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_invoices FORCE ROW LEVEL SECURITY;

-- Enable RLS pada home_visit_reports
ALTER TABLE home_visit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visit_reports FORCE ROW LEVEL SECURITY;
```

**Validation:**

- [ ] Migration berhasil dijalankan
- [ ] Di Neon console, cek RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- [ ] Semua tabel tenant-scoped memiliki `rowsecurity = true`

---

### TASK 3: Create Permissions Definitions ⏱️ 1 jam

**File:** `src/lib/server/auth/permissions.ts`

**Description:**
Create permission definitions dan role-permission mapping untuk RBAC.

**Steps:**

1. Create file: `src/lib/server/auth/permissions.ts`
2. Copy paste complete content
3. Update `authorization.ts` untuk menggunakan permissions.ts
4. Save

**File Content:**

```typescript
import type { UserRole } from '$lib/server/db/schema';

// Define all available permissions
export type Permission =
	// Tenant Management
	| 'tenant:read'
	| 'tenant:create'
	| 'tenant:update'
	| 'tenant:delete'
	| 'tenant:manage_status'

	// User Management
	| 'user:read'
	| 'user:create'
	| 'user:update'
	| 'user:delete'
	| 'user:invite'
	| 'user:manage_roles'

	// School Configuration
	| 'settings:read'
	| 'settings:manage'
	| 'branding:manage'
	| 'admission_paths:manage'
	| 'fee_structures:manage'

	// Verification
	| 'verification:read'
	| 'verification:manage'
	| 'documents:verify'

	// Scoring & Ranking
	| 'scoring:read'
	| 'scoring:input'
	| 'scoring:finalize'
	| 'ranking:view'
	| 'ranking:finalize'

	// Finance
	| 'finance:view'
	| 'finance:verify_manual'
	| 'finance:payout'
	| 'finance:export'

	// Communication
	| 'broadcast:view'
	| 'broadcast:create'
	| 'notification:manage'

	// Reports & Analytics
	| 'reports:view'
	| 'reports:export'
	| 'reports:dapodik'

	// Super Admin Only
	| 'super_admin:access'
	| 'super_admin:platform_settings'
	| 'super_admin:impersonate'
	| 'super_admin:view_audit_logs'
	| 'super_admin:health_monitoring';

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
	super_admin: [
		'tenant:read',
		'tenant:create',
		'tenant:update',
		'tenant:delete',
		'tenant:manage_status',
		'user:read',
		'user:create',
		'user:update',
		'user:delete',
		'user:invite',
		'user:manage_roles',
		'settings:read',
		'settings:manage',
		'branding:manage',
		'admission_paths:manage',
		'fee_structures:manage',
		'verification:read',
		'verification:manage',
		'documents:verify',
		'scoring:read',
		'scoring:input',
		'scoring:finalize',
		'ranking:view',
		'ranking:finalize',
		'finance:view',
		'finance:verify_manual',
		'finance:payout',
		'finance:export',
		'broadcast:view',
		'broadcast:create',
		'notification:manage',
		'reports:view',
		'reports:export',
		'reports:dapodik',
		'super_admin:access',
		'super_admin:platform_settings',
		'super_admin:impersonate',
		'super_admin:view_audit_logs',
		'super_admin:health_monitoring'
	],

	school_admin: [
		'tenant:read',
		'tenant:update',
		'user:read',
		'user:create',
		'user:update',
		'user:invite',
		'settings:read',
		'settings:manage',
		'branding:manage',
		'admission_paths:manage',
		'fee_structures:manage',
		'verification:read',
		'verification:manage',
		'documents:verify',
		'scoring:read',
		'scoring:input',
		'scoring:finalize',
		'ranking:view',
		'ranking:finalize',
		'finance:view',
		'finance:verify_manual',
		'finance:export',
		'broadcast:view',
		'broadcast:create',
		'notification:manage',
		'reports:view',
		'reports:export',
		'reports:dapodik'
	],

	verifier: ['tenant:read', 'verification:read', 'verification:manage', 'documents:verify'],

	treasurer: [
		'tenant:read',
		'finance:view',
		'finance:verify_manual',
		'finance:payout',
		'finance:export',
		'reports:view'
	],

	interviewer: ['tenant:read', 'scoring:read', 'scoring:input'],

	field_officer: ['tenant:read', 'verification:read', 'scoring:read', 'scoring:input'],

	parent: ['tenant:read']
};

// Helper functions
export function getPermissionsForRole(role: UserRole): Permission[] {
	return rolePermissions[role] || [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
	const permissions = getPermissionsForRole(role);
	return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
	const userPermissions = getPermissionsForRole(role);
	return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
	const userPermissions = getPermissionsForRole(role);
	return permissions.every((p) => userPermissions.includes(p));
}
```

**Validation:**

- [ ] File created
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Import works di authorization.ts

---

### TASK 4: Add Zod Validation Schemas ⏱️ 2 jam

**File:** `src/lib/server/validators/admin.ts`

**Description:**
Create Zod validation schemas untuk admin forms (tenant creation, user invitation, dll).

**Steps:**

1. Create directory: `mkdir -p src/lib/server/validators`
2. Create file: `src/lib/server/validators/admin.ts`
3. Copy paste Zod schemas
4. Update `src/routes/admin/register/+page.server.ts` untuk gunakan validation

**File Content:**

```typescript
import { z } from 'zod';

// Tenant Creation Schema
export const createTenantSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
	slug: z
		.string()
		.min(2, 'Slug minimal 2 karakter')
		.max(50, 'Slug maksimal 50 karakter')
		.regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan hyphen')
		.refine(
			(val) => !['www', 'app', 'api', 'admin', 'super-admin', 'sign-in', 'sign-up'].includes(val),
			{
				message: 'Slug ini reserved dan tidak bisa digunakan'
			}
		),
	type: z.enum(['single', 'foundation']).default('single'),
	npsn: z
		.string()
		.optional()
		.refine((val) => !val || /^[0-9]{8}$/.test(val), {
			message: 'NPSN harus 8 digit angka'
		}),
	level: z.string().optional(),
	province: z.string().optional(),
	city: z.string().optional(),
	district: z.string().optional(),
	address: z.string().optional().max(500, 'Alamat maksimal 500 karakter'),
	postalCode: z
		.string()
		.optional()
		.refine((val) => !val || /^[0-9]{5}$/.test(val), {
			message: 'Kode pos harus 5 digit angka'
		})
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// Tenant Update Schema
export const updateTenantSchema = z
	.object({
		id: z.string().uuid('ID tidak valid'),
		name: z.string().min(2).max(100).optional(),
		status: z.enum(['active', 'inactive']).optional(),
		level: z.string().optional()
	})
	.refine((data) => data.name || data.status, {
		message: 'Minimal ada satu field yang diupdate'
	});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

// User Invitation Schema
export const inviteUserSchema = z.object({
	email: z.string().email('Email tidak valid'),
	role: z.enum(['school_admin', 'verifier', 'treasurer', 'interviewer', 'field_officer']),
	name: z.string().min(2, 'Nama minimal 2 karakter').max(100).optional()
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

// Fee Structure Schema
export const feeStructureSchema = z.object({
	name: z.string().min(2, 'Nama biaya minimal 2 karakter').max(100),
	amount: z.number().int().positive('Jumlah harus positif'),
	currency: z.string().default('IDR'),
	paymentTiming: z.enum(['registration', 'acceptance', 'enrollment', 'custom']),
	dueDateOffsetDays: z.number().int().min(0).default(0),
	penaltyAmount: z.number().int().min(0).optional(),
	penaltyGraceDays: z.number().int().min(0).optional()
});

export type FeeStructureInput = z.infer<typeof feeStructureSchema>;

// Admission Path Schema
export const admissionPathSchema = z.object({
	name: z.string().min(2, 'Nama jalur minimal 2 karakter').max(100),
	description: z.string().max(500).optional(),
	quota: z.number().int().positive('Kuota harus positif'),
	unitId: z.string().uuid().optional(),
	announcementDate: z.string().datetime().optional()
});

export type AdmissionPathInput = z.infer<typeof admissionPathSchema>;

// Broadcast Message Schema
export const broadcastSchema = z.object({
	targetSegment: z.enum(['all', 'pending_verification', 'accepted', 'rejected', 'waitlisted']),
	messageTemplate: z
		.string()
		.min(10, 'Pesan minimal 10 karakter')
		.max(2000, 'Pesan maksimal 2000 karakter')
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;
```

**Update to admin register page:**

```typescript
// src/routes/admin/register/+page.server.ts
import { createTenantSchema } from '$lib/server/validators/admin';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = {
			name: formData.get('name')?.toString() || '',
			slug: formData.get('slug')?.toString() || ''
			// ... other fields
		};

		// Validate with Zod
		const validation = createTenantSchema.safeParse(data);

		if (!validation.success) {
			return fail(400, {
				errors: validation.error.flatten().fieldErrors,
				values: data
			});
		}

		// Proceed dengan validation.data
	}
};
```

**Validation:**

- [ ] File created
- [ ] Validation works dengan valid input
- [ ] Validation rejects invalid input
- [ ] Error messages clear

---

### TASK 5: Add Rate Limiting ⏱️ 1 jam

**File:** `src/hooks.server.ts`

**Description:**
Add rate limiting middleware menggunakan Cloudflare built-in (tanpa extra dependencies).

**Steps:**

1. Open `src/hooks.server.ts`
2. Add rate limiting helper functions
3. Add rate limit check di awal `handle` function
4. Save

**Code Changes:**

```typescript
// Add before export const handle:

// Rate limiter configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = {
	admin: 60, // 60 requests per minute for admin endpoints
	api: 100, // 100 requests per minute for API endpoints
	public: 200, // 200 requests per minute for public pages
	auth: 10 // 10 attempts per minute for auth endpoints
};

// In-memory rate limit store (for single-instance dev)
// Production: Use Cloudflare KV or Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(
	key: string,
	maxRequests: number
): { success: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const existing = rateLimitStore.get(key);

	if (!existing || now > existing.resetAt) {
		rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return { success: true, remaining: maxRequests - 1, resetAt: now + RATE_LIMIT_WINDOW };
	}

	if (existing.count >= maxRequests) {
		return { success: false, remaining: 0, resetAt: existing.resetAt };
	}

	existing.count++;
	return { success: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

function getRateLimitKey(event: RequestEvent): { key: string; max: number } {
	const path = event.url.pathname;
	const ip = event.request.headers.get('cf-connecting-ip') || 'unknown';

	// Auth endpoints
	if (path.includes('/sign-in') || path.includes('/sign-up') || path.includes('/forgot-password')) {
		return { key: `auth:${ip}`, max: RATE_LIMIT_MAX.auth };
	}

	// Admin endpoints
	if (path.startsWith('/admin')) {
		const userId = event.cookies.get('session_id') || ip;
		return { key: `admin:${userId}`, max: RATE_LIMIT_MAX.admin };
	}

	// API endpoints
	if (path.startsWith('/api')) {
		return { key: `api:${ip}`, max: RATE_LIMIT_MAX.api };
	}

	// Public pages
	return { key: `public:${ip}`, max: RATE_LIMIT_MAX.public };
}

// Then in export const handle:
export const handle: Handle = async ({ event, resolve }) => {
	// Rate limiting (except static assets)
	if (!event.url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
		const { key, max } = getRateLimitKey(event);
		const { success, remaining, resetAt } = rateLimit(key, max);

		event.request.headers.set('X-RateLimit-Limit', max.toString());
		event.request.headers.set('X-RateLimit-Remaining', remaining.toString());
		event.request.headers.set('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString());

		if (!success) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
					'Content-Type': 'text/plain'
				}
			});
		}
	}

	// ... existing subdomain resolution and auth logic ...
};
```

**Validation:**

- [ ] Rate limiting active di admin endpoints
- [ ] Rate limiting active di auth endpoints
- [ ] 429 response dengan Retry-After header
- [ ] Headers ter-set dengan benar

---

## 📊 PROGRESS TRACKING

| Task              | Status | Notes |
| ----------------- | ------ | ----- |
| 1. Audit Log Fix  | ☐      |       |
| 2. RLS Migration  | ☐      |       |
| 3. Permissions    | ☐      |       |
| 4. Zod Validation | ☐      |       |
| 5. Rate Limiting  | ☐      |       |

---

## 🧪 TESTING CHECKLIST

After completing all tasks:

```bash
# 1. TypeScript check
npm run typecheck
# Expected: No errors

# 2. Lint check
npm run lint
# Expected: No errors

# 3. Build check
npm run build
# Expected: Success

# 4. Database migration
npm run db:push
# Expected: Success, RLS enabled

# 5. Manual testing
# - Create tenant dengan valid data → Success
# - Create tenant dengan slug "admin" → Error "Reserved slug"
# - Create tenant dengan slug "abc@#$" → Error validation
# - Rapid API calls → 429 response
```

---

## 📁 FILES SUMMARY

### Files to CREATE (3 files):

| File                                     | Purpose                |
| ---------------------------------------- | ---------------------- |
| `drizzle/migrations/0011_enable_rls.sql` | RLS policy migration   |
| `src/lib/server/auth/permissions.ts`     | Permission definitions |
| `src/lib/server/validators/admin.ts`     | Zod validation schemas |

### Files to MODIFY (2 files):

| File                                   | Change                    |
| -------------------------------------- | ------------------------- |
| `src/lib/server/domain/admin/index.ts` | Fix audit log transaction |
| `src/hooks.server.ts`                  | Add rate limiting         |

---

## 💡 TIPS

1. **Backup** sebelum mulai: `git add . && git commit -m "Backup before security improvements"`
2. **Test di dev** dulu sebelum production
3. **Catat error** jika ada, untuk debugging
4. **Lakukan bertahap** - satu task per session

---

## 📚 REFERENCE

| Resource           | Link                                                         |
| ------------------ | ------------------------------------------------------------ |
| Drizzle ORM        | https://orm.drizzle.team                                     |
| Zod Validation     | https://zod.dev                                              |
| Cloudflare Workers | https://developers.cloudflare.com/workers                    |
| Row-Level Security | https://www.postgresql.org/docs/current/ddl-rowsecurity.html |

---

**Created:** 2026-01-21
**Status:** Ready for Execution
**Priority:** Critical Security
