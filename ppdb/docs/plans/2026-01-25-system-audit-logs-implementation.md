# System Audit Logs - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Build comprehensive audit logging system to track all system activities including user actions, CRUD operations, integration calls, failed attempts, and system events.

**Architecture:** PostgreSQL-based audit logs with Drizzle ORM, Svelte UI components with TanStack Table for filtering/pagination, server-side logging helper functions called from key integration points throughout the application.

**Tech Stack:** PostgreSQL, Drizzle ORM, Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, PapaParse (CSV export), ExcelJS (Excel export).

---

## Phase 1: Foundation

### Task 1: Update Audit Logs Database Schema

**Files:**
- Modify: `src/lib/server/db/schema.ts:202`
- Create: `drizzle/0000_update_audit_logs.sql`

**Step 1: Read existing auditLogs schema**

Read: `src/lib/server/db/schema.ts` lines 202-210
Current schema:
```typescript
export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorId: uuid('actor_id').notNull(),
	action: text('action').notNull(),
	target: text('target').notNull(),
	details: text('details'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
```

**Step 2: Define enums for audit logs**

Add to `src/lib/server/db/schema.ts` after existing enums (around line 80):

```typescript
// Audit Log Enums
export const auditActionEnum = pgEnum('audit_action', [
	'LOGIN',
	'LOGOUT',
	'CREATE',
	'READ',
	'UPDATE',
	'DELETE',
	'EXPORT',
	'BULK_OPERATION',
	'SCHEDULED_JOB',
	'SYSTEM_EVENT',
	'API_CALL',
	'FAILED_ATTEMPT'
]);

export const auditEntityTypeEnum = pgEnum('audit_entity_type', [
	'USER',
	'TENANT',
	'APPLICATION',
	'INVOICE',
	'SETTING',
	'PERMISSION',
	'INTEGRATION',
	'JOB'
]);

export const auditSeverityEnum = pgEnum('audit_severity', ['info', 'warning', 'error', 'critical']);
export const auditStatusEnum = pgEnum('audit_status', ['success', 'failed', 'pending']);
```

**Step 3: Replace auditLogs table definition**

Replace `src/lib/server/db/schema.ts` lines 202-210 with:

```typescript
export const auditLogs = pgTable(
	'audit_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
		userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

		// Event metadata
		action: auditActionEnum('action').notNull(),
		entityType: auditEntityTypeEnum('entity_type').notNull(),
		entityId: uuid('entity_id').notNull(),

		// Details
		details: jsonb('details').$type<{
			before?: Record<string, any>;
			after?: Record<string, any>;
			metadata?: Record<string, any>;
		}>(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),

		// Context
		severity: auditSeverityEnum('severity').notNull().default('info'),
		status: auditStatusEnum('status').notNull().default('success'),

		// Timestamps
		createdAt: timestamp('created_at').defaultNow().notNull(),
		indexedAt: timestamp('indexed_at').defaultNow().notNull()
	},
	(table) => ({
		tenantIdx: index('idx_audit_logs_tenant').on(table.tenantId),
		userIdx: index('idx_audit_logs_user').on(table.userId),
		actionIdx: index('idx_audit_logs_action').on(table.action),
		createdIdx: index('idx_audit_logs_created').on(table.createdAt),
		indexedIdx: index('idx_audit_logs_indexed').on(table.indexedAt),
		tenantCreatedIdx: index('idx_audit_logs_tenant_created').on(table.tenantId, table.createdAt),
		userCreatedIdx: index('idx_audit_logs_user_created').on(table.userId, table.createdAt)
	})
);
```

**Step 4: Generate migration**

Run: `bunx drizzle-kit generate`

Expected: New migration file created in `drizzle/` directory

**Step 5: Commit**

```bash
git add src/lib/server/db/schema.ts drizzle/
git commit -m "feat: enhance audit logs schema with comprehensive tracking

- Add enums: action, entity_type, severity, status
- Add fields: tenant_id, user_id, entity_id, details (JSONB)
- Add context: ip_address, user_agent
- Add indexes for performance
- Support for before/after tracking in details"
```

---

### Task 2: Create Audit Logs Logger Helper

**Files:**
- Create: `src/lib/server/audit-logs/logger.ts`
- Create: `src/lib/server/audit-logs/types.ts`

**Step 1: Create type definitions**

Create: `src/lib/server/audit-logs/types.ts`

```typescript
import type { auditActionEnum, auditEntityTypeEnum, auditSeverityEnum, auditStatusEnum } from '$lib/server/db/schema';

export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type AuditEntityType = (typeof auditEntityTypeEnum.enumValues)[number];
export type AuditSeverity = (typeof auditSeverityEnum.enumValues)[number];
export type AuditStatus = (typeof auditStatusEnum.enumValues)[number];

export interface AuditLogEvent {
	action: AuditAction;
	entityType: AuditEntityType;
	entityId: string;
	userId?: string;
	tenantId?: string;
	details?: {
		before?: Record<string, any>;
		after?: Record<string, any>;
		metadata?: Record<string, any>;
	};
	severity?: AuditSeverity;
	status?: AuditStatus;
	ipAddress?: string;
	userAgent?: string;
}

export interface AuditLogFilters {
	search?: string;
	action?: AuditAction;
	entityType?: AuditEntityType;
	severity?: AuditSeverity;
	status?: AuditStatus;
	userId?: string;
	tenantId?: string;
	dateFrom?: Date;
	dateTo?: Date;
	page?: number;
	limit?: number;
}
```

**Step 2: Create logger function**

Create: `src/lib/server/audit-logs/logger.ts`

```typescript
import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import type { AuditLogEvent, AuditAction, AuditEntityType, AuditSeverity, AuditStatus } from './types';
import { nanoid } from 'nanoid';

/**
 * Log an audit event to the database
 * Call this from anywhere in the app to track system activities
 */
export async function logAuditEvent(data: AuditLogEvent): Promise<void> {
	try {
		await db.insert(auditLogs).values({
			id: nanoid(),
			tenantId: data.tenantId || null,
			userId: data.userId || null,
			action: data.action,
			entityType: data.entityType,
			entityId: data.entityId,
			details: data.details || {},
			ipAddress: data.ipAddress || null,
			userAgent: data.userAgent || null,
			severity: data.severity || 'info',
			status: data.status || 'success',
			indexedAt: new Date()
		});
	} catch (error) {
		// Log errors but don't throw - audit logging shouldn't break the app
		console.error('Failed to log audit event:', error);
	}
}

/**
 * Helper to log successful events
 */
export async function logSuccess(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: options?.details,
		severity: 'info',
		status: 'success',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}

/**
 * Helper to log failed events
 */
export async function logFailure(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	error: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: {
			...options?.details,
			metadata: { ...options?.details?.metadata, error }
		},
		severity: 'error',
		status: 'failed',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}

/**
 * Helper to log warning events
 */
export async function logWarning(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	message: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: {
			...options?.details,
			metadata: { ...options?.details?.metadata, message }
		},
		severity: 'warning',
		status: 'success',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}
```

**Step 3: Install nanoid dependency**

Run: `bun add nanoid`

Expected: Package installed and added to package.json

**Step 4: Commit**

```bash
git add src/lib/server/audit-logs/ package.json bun.lockb
git commit -m "feat: add audit logs logger helper functions

- Add type definitions for audit events
- Add logAuditEvent() main function
- Add helpers: logSuccess(), logFailure(), logWarning()
- Install nanoid for ID generation"
```

---

### Task 3: Create Audit Logs Query Functions

**Files:**
- Create: `src/lib/server/audit-logs/queries.ts`

**Step 1: Create query functions**

Create: `src/lib/server/audit-logs/queries.ts`

```typescript
import { db } from '$lib/server/db';
import { auditLogs, users, tenants } from '$lib/server/db/schema';
import { desc, and, or, ilike, gte, lte, eq, sql, count } from 'drizzle-orm';
import type { AuditLogFilters } from './types';

export interface AuditLogWithRelations {
	id: string;
	tenantId: string | null;
	userId: string | null;
	action: string;
	entityType: string;
	entityId: string;
	details: Record<string, any> | null;
	ipAddress: string | null;
	userAgent: string | null;
	severity: string;
	status: string;
	createdAt: Date;
	indexedAt: Date;
	user?: { id: string; name: string | null; email: string; role: string } | null;
	tenant?: { id: string; name: string } | null;
}

export interface AuditLogStats {
	total: number;
	today: number;
	thisWeek: number;
	thisMonth: number;
	byAction: Record<string, number>;
	bySeverity: Record<string, number>;
	byStatus: Record<string, number>;
}

/**
 * Fetch audit logs with pagination and filters
 */
export async function fetchAuditLogs(filters: AuditLogFilters): Promise<{
	logs: AuditLogWithRelations[];
	total: number;
	stats: AuditLogStats;
}> {
	const page = filters.page || 1;
	const limit = filters.limit || 50;
	const offset = (page - 1) * limit;

	// Build conditions
	const conditions = [];

	if (filters.search) {
		conditions.push(
			or(
				ilike(auditLogs.entityId, `%${filters.search}%`),
				sql`${auditLogs.details}->>'before' ILIKE ${`%${filters.search}%`}`,
				sql`${auditLogs.details}->>'after' ILIKE ${`%${filters.search}%`}`
			)
		);
	}

	if (filters.action) {
		conditions.push(eq(auditLogs.action, filters.action));
	}

	if (filters.entityType) {
		conditions.push(eq(auditLogs.entityType, filters.entityType));
	}

	if (filters.severity) {
		conditions.push(eq(auditLogs.severity, filters.severity));
	}

	if (filters.status) {
		conditions.push(eq(auditLogs.status, filters.status));
	}

	if (filters.userId) {
		conditions.push(eq(auditLogs.userId, filters.userId));
	}

	if (filters.tenantId) {
		conditions.push(eq(auditLogs.tenantId, filters.tenantId));
	}

	if (filters.dateFrom) {
		conditions.push(gte(auditLogs.createdAt, filters.dateFrom));
	}

	if (filters.dateTo) {
		conditions.push(lte(auditLogs.createdAt, filters.dateTo));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Fetch logs with relations
	const logsResult = await db
		.select({
			log: auditLogs,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role
			},
			tenant: {
				id: tenants.id,
				name: tenants.name
			}
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.leftJoin(tenants, eq(auditLogs.tenantId, tenants.id))
		.where(whereClause)
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit)
		.offset(offset);

	const logs = logsResult.map((row) => ({
		...row.log,
		user: row.user,
		tenant: row.tenant
	})) as AuditLogWithRelations[];

	// Get total count
	const totalResult = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(whereClause);

	const total = totalResult[0]?.count || 0;

	// Get stats
	const stats = await getAuditLogStats(filters);

	return { logs, total, stats };
}

/**
 * Get audit log statistics
 */
async function getAuditLogStats(filters: AuditLogFilters): Promise<AuditLogStats> {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
	const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	// Total count
	const [totalResult] = await db.select({ count: count() }).from(auditLogs);

	// Today count
	const [todayResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, today));

	// This week count
	const [weekResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, thisWeek));

	// This month count
	const [monthResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, thisMonth));

	// By action
	const actionResults = await db
		.select({
			action: auditLogs.action,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.action);

	const byAction = actionResults.reduce((acc, row) => {
		acc[row.action] = row.count;
		return acc;
	}, {} as Record<string, number>);

	// By severity
	const severityResults = await db
		.select({
			severity: auditLogs.severity,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.severity);

	const bySeverity = severityResults.reduce((acc, row) => {
		acc[row.severity] = row.count;
		return acc;
	}, {} as Record<string, number>);

	// By status
	const statusResults = await db
		.select({
			status: auditLogs.status,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.status);

	const byStatus = statusResults.reduce((acc, row) => {
		acc[row.status] = row.count;
		return acc;
	}, {} as Record<string, number>);

	return {
		total: totalResult.count || 0,
		today: todayResult.count || 0,
		thisWeek: weekResult.count || 0,
		thisMonth: monthResult.count || 0,
		byAction,
		bySeverity,
		byStatus
	};
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(id: string): Promise<AuditLogWithRelations | null> {
	const result = await db
		.select({
			log: auditLogs,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role
			},
			tenant: {
				id: tenants.id,
				name: tenants.name
			}
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.leftJoin(tenants, eq(auditLogs.tenantId, tenants.id))
		.where(eq(auditLogs.id, id))
		.limit(1);

	if (!result[0]) return null;

	return {
		...result[0].log,
		user: result[0].user,
		tenant: result[0].tenant
	} as AuditLogWithRelations;
}
```

**Step 2: Export from index**

Create: `src/lib/server/audit-logs/index.ts`

```typescript
export * from './logger';
export * from './queries';
export * from './types';
```

**Step 3: Commit**

```bash
git add src/lib/server/audit-logs/
git commit -m "feat: add audit logs query functions

- Add fetchAuditLogs() with pagination and filters
- Add getAuditLogById() for single log retrieval
- Add getAuditLogStats() for statistics
- Support joins with users and tenants
- Add date range, search, and filter conditions"
```

---

### Task 4: Create Audit Logs Page Server Load Function

**Files:**
- Create: `src/routes/admin/system/audit-logs/+page.server.ts`

**Step 1: Create server load function**

Create: `src/routes/admin/system/audit-logs/+page.server.ts`

```typescript
import { db } from '$lib/server/db';
import { users, tenants } from '$lib/server/db/schema';
import { fetchAuditLogs } from '$lib/server/audit-logs';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	// Parse filters from URL
	const filters = {
		search: url.searchParams.get('q') || undefined,
		action: (url.searchParams.get('action') as any) || undefined,
		entityType: (url.searchParams.get('entity') as any) || undefined,
		severity: (url.searchParams.get('severity') as any) || undefined,
		status: (url.searchParams.get('status') as any) || undefined,
		userId: url.searchParams.get('userId') || undefined,
		tenantId: url.searchParams.get('tenantId') || undefined,
		dateFrom: url.searchParams.get('from')
			? new Date(url.searchParams.get('from') as string)
			: undefined,
		dateTo: url.searchParams.get('to') ? new Date(url.searchParams.get('to') as string) : undefined,
		page: parseInt(url.searchParams.get('page') || '1'),
		limit: parseInt(url.searchParams.get('limit') || '50')
	};

	// Fetch logs and stats
	const { logs, total, stats } = await fetchAuditLogs(filters);

	// Fetch filter options
	const [allUsers, allTenants] = await Promise.all([
		db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(users)
			.orderBy(users.name),
		db
			.select({ id: tenants.id, name: tenants.name })
			.from(tenants)
			.orderBy(tenants.name)
	]);

	return {
		logs,
		total,
		stats,
		filters,
		filterOptions: {
			users: allUsers,
			tenants: allTenants
		}
	};
};
```

**Step 2: Commit**

```bash
git add src/routes/admin/system/audit-logs/+page.server.ts
git commit -m "feat: add audit logs page server load function

- Parse filters from URL query params
- Fetch logs with pagination
- Fetch filter options (users, tenants)
- Require super admin authorization"
```

---

### Task 5: Create Audit Logs Page UI - Basic Table

**Files:**
- Create: `src/routes/admin/system/audit-logs/+page.svelte`
- Modify: `src/lib/i18n/loaders/en.ts`
- Modify: `src/lib/i18n/loaders/id.ts`

**Step 1: Add i18n translations**

Modify: `src/lib/i18n/loaders/en.ts`

Add to admin section (around line 300+):

```typescript
auditLogs: {
	title: 'Audit Logs',
	description: 'Track all system activities and events',
	systemStatus: 'System Status',
	actions: 'Actions',
	entityType: 'Entity Type',
	severity: 'Severity',
	status: 'Status',
	ipAddress: 'IP Address',
	timestamp: 'Timestamp',
	user: 'User',
	entity: 'Entity',
	details: 'Details',
	viewDetails: 'View Details',
	export: 'Export',
	filters: 'Filters',
	search: 'Search logs...',
	filterByAction: 'Filter by action',
	filterByEntity: 'Filter by entity',
	filterBySeverity: 'Filter by severity',
	filterByStatus: 'Filter by status',
	filterByUser: 'Filter by user',
	filterByTenant: 'Filter by tenant',
	dateRange: 'Date Range',
	clearFilters: 'Clear Filters',
	noLogsFound: 'No logs found',
	loadMore: 'Load More',
	showing: 'Showing',
	of: 'of',
	logs: 'logs',
	stats: {
		total: 'Total Logs',
		today: 'Today',
		thisWeek: 'This Week',
		thisMonth: 'This Month',
		byAction: 'By Action',
		bySeverity: 'By Severity',
		byStatus: 'By Status'
	}
}
```

Modify: `src/lib/i18n/loaders/id.ts`

Add same structure with Indonesian translations:

```typescript
auditLogs: {
	title: 'Log Audit',
	description: 'Pantau semua aktivitas dan kejadian sistem',
	systemStatus: 'Status Sistem',
	actions: 'Aksi',
	entityType: 'Tipe Entitas',
	severity: 'Tingkat Keparahan',
	status: 'Status',
	ipAddress: 'Alamat IP',
	timestamp: 'Waktu',
	user: 'Pengguna',
	entity: 'Entitas',
	details: 'Detail',
	viewDetails: 'Lihat Detail',
	export: 'Ekspor',
	filters: 'Filter',
	search: 'Cari log...',
	filterByAction: 'Filter berdasarkan aksi',
	filterByEntity: 'Filter berdasarkan entitas',
	filterBySeverity: 'Filter berdasarkan tingkat',
	filterByStatus: 'Filter berdasarkan status',
	filterByUser: 'Filter berdasarkan pengguna',
	filterByTenant: 'Filter berdasarkan tenant',
	dateRange: 'Rentang Tanggal',
	clearFilters: 'Hapus Filter',
	noLogsFound: 'Tidak ada log ditemukan',
	loadMore: 'Muat Lebih Banyak',
	showing: 'Menampilkan',
	of: 'dari',
	logs: 'log',
	stats: {
		total: 'Total Log',
		today: 'Hari Ini',
		thisWeek: 'Minggu Ini',
		thisMonth: 'Bulan Ini',
		byAction: 'Berdasarkan Aksi',
		bySeverity: 'Berdasarkan Tingkat',
		byStatus: 'Berdasarkan Status'
	}
}
```

**Step 2: Create basic page UI**

Create: `src/routes/admin/system/audit-logs/+page.svelte`

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Activity,
		ShieldAlert,
		CheckCircle,
		XCircle,
		AlertTriangle,
		Download,
		Search,
		Filter,
		User,
		Building2
	} from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	const getSeverityColor = (severity: string) => {
		switch (severity.toLowerCase()) {
			case 'info':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
			case 'warning':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'error':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			case 'critical':
				return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getSeverityIcon = (severity: string) => {
		switch (severity.toLowerCase()) {
			case 'info':
				return CheckCircle;
			case 'warning':
				return AlertTriangle;
			case 'error':
			case 'critical':
				return XCircle;
			default:
				return Activity;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'success':
				return CheckCircle;
			case 'failed':
				return XCircle;
			case 'pending':
				return AlertTriangle;
			default:
				return Activity;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'success':
				return 'text-green-600';
			case 'failed':
				return 'text-red-600';
			case 'pending':
				return 'text-yellow-600';
			default:
				return 'text-gray-600';
		}
	};

	const getActionColor = (action: string) => {
		switch (action.toLowerCase()) {
			case 'create':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'update':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
			case 'delete':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			case 'login':
				return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
			case 'failed_attempt':
				return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
			case 'system_event':
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};
</script>

<AdminPageHeader
	title={i18n.t('admin.auditLogs.title')}
	description={i18n.t('admin.auditLogs.description')}
/>

<!-- Stats Cards -->
<div class="grid gap-4 md:grid-cols-4 mb-8">
	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.total')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.stats.total}</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.today')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.stats.today}</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.thisWeek')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.stats.thisWeek}</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.thisMonth')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.stats.thisMonth}</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Filters Bar -->
<Card.Root class="mb-6">
	<Card.Content class="pt-6">
		<div class="flex items-center gap-4 mb-4">
			<Filter class="h-5 w-5 text-muted-foreground" />
			<h3 class="font-semibold">{i18n.t('admin.auditLogs.filters')}</h3>
		</div>

		<div class="grid gap-4 md:grid-cols-4">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder={i18n.t('admin.auditLogs.search')}
					class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
					bind:value={$page.url.searchParams.get('q') || ''}
				/>
			</div>

			<!-- Date Range -->
			<div class="flex gap-2">
				<input
					type="date"
					class="flex-1 px-3 py-2 border border-input rounded-md bg-background"
					bind:value={$page.url.searchParams.get('from') || ''}
				/>
				<input
					type="date"
					class="flex-1 px-3 py-2 border border-input rounded-md bg-background"
					bind:value={$page.url.searchParams.get('to') || ''}
				/>
			</div>

			<!-- Clear Filters -->
			<Button variant="outline" class="w-full">
				{i18n.t('admin.auditLogs.clearFilters')}
			</Button>

			<!-- Export -->
			<Button variant="default" class="w-full">
				<Download class="h-4 w-4 mr-2" />
				{i18n.t('admin.auditLogs.export')}
			</Button>
		</div>
	</Card.Content>
</Card.Root>

<!-- Logs Table -->
<Card.Root>
	<Card.Content class="p-0">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.timestamp')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.user')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.actions')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.entity')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.severity')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.status')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.ipAddress')}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each data.logs as log}
						<tr class="hover:bg-muted/50">
							<td class="px-4 py-3 text-sm">
								{new Date(log.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}
							</td>
							<td class="px-4 py-3 text-sm">
								{#if log.user}
									<div class="flex items-center gap-2">
										<User class="h-4 w-4 text-muted-foreground" />
										<span>{log.user.name || log.user.email}</span>
										<Badge variant="outline" class="text-xs">
											{log.user.role}
										</Badge>
									</div>
								{:else}
									<span class="text-muted-foreground">System</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm">
								<Badge class={getActionColor(log.action)} variant="outline">
									{log.action}
								</Badge>
							</td>
							<td class="px-4 py-3 text-sm">
								<div class="flex items-center gap-2">
									<span class="font-mono text-xs">{log.entityType}</span>
									<span class="text-muted-foreground">:</span>
									<span class="font-mono text-xs">{log.entityId.slice(0, 8)}...</span>
								</div>
							</td>
							<td class="px-4 py-3 text-sm">
								<Badge class={getSeverityColor(log.severity)} variant="outline">
									<svelte:component this={getSeverityIcon(log.severity)} class="h-3 w-3 mr-1" />
									{log.severity}
								</Badge>
							</td>
							<td class="px-4 py-3 text-sm">
								<svelte:component
									this={getStatusIcon(log.status)}
									class="h-4 w-4 {getStatusColor(log.status)}"
								/>
							</td>
							<td class="px-4 py-3 text-sm font-mono text-xs">
								{log.ipAddress || '-'}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
								{i18n.t('admin.auditLogs.noLogsFound')}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.total > 0}
			<div class="flex items-center justify-between px-4 py-3 border-t">
				<div class="text-sm text-muted-foreground">
					{i18n.t('admin.auditLogs.showing')} {(data.filters.page - 1) * data.filters.limit + 1}
					{i18n.t('admin.auditLogs.of')} {Math.min(data.filters.page * data.filters.limit, data.total)}
					{i18n.t('admin.auditLogs.of')} {data.total} {i18n.t('admin.auditLogs.logs')}
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={data.filters.page === 1}
						onclick={() => {
							const url = new URL(window.location.href);
							url.searchParams.set('page', String(data.filters.page - 1));
							window.location.href = url.toString();
						}}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={data.filters.page * data.filters.limit >= data.total}
						onclick={() => {
							const url = new URL(window.location.href);
							url.searchParams.set('page', String(data.filters.page + 1));
							window.location.href = url.toString();
						}}
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<style>
	:global(.grid) {
		display: grid;
	}
</style>
```

**Step 3: Commit**

```bash
git add src/routes/admin/system/audit-logs/+page.svelte src/lib/i18n/loaders/
git commit -m "feat: add audit logs page UI with basic table

- Add i18n translations (en + id)
- Create stats cards (total, today, week, month)
- Create filters bar (search, date range, clear, export)
- Create logs table with pagination
- Add color-coded badges for action, severity, status
- Add user/tenant info display"
```

---

### Task 6: Integrate Login/Logout Logging

**Files:**
- Modify: `src/lib/server/auth/login.ts` (or equivalent)
- Modify: `src/lib/server/auth/logout.ts` (or equivalent)

**Step 1: Find auth login/logout files**

Run: `find src/lib/server/auth -name "*.ts" | grep -E "(login|logout|auth)" | head -10`

Expected: List of auth-related files

**Step 2: Add login logging**

Modify the login function to add audit logging:

```typescript
import { logSuccess, logFailure } from '$lib/server/audit-logs';

// In your login function
export async function login(credentials: LoginInput, request: Request) {
	const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	const userAgent = request.headers.get('user-agent') || 'unknown';

	try {
		const user = await authenticate(credentials);

		// Log successful login
		await logSuccess('LOGIN', 'USER', user.id, {
			userId: user.id,
			tenantId: user.tenantId,
			details: {
				metadata: { email: user.email, method: 'credentials' }
			},
			ipAddress: ip,
			userAgent
		});

		return user;
	} catch (error) {
		// Log failed login attempt
		await logFailure('FAILED_ATTEMPT', 'USER', credentials.email, error.message, {
			details: { metadata: { email: credentials.email, attempt: 'login' } },
			ipAddress: ip,
			userAgent
		});

		throw error;
	}
}
```

**Step 3: Add logout logging**

```typescript
// In your logout function
export async function logout(userId: string, tenantId?: string) {
	// Log logout
	await logSuccess('LOGOUT', 'USER', userId, {
		userId,
		tenantId,
		details: { metadata: { method: 'manual' } }
	});

	// Your existing logout logic...
}
```

**Step 4: Commit**

```bash
git add src/lib/server/auth/
git commit -m "feat: add audit logging to login/logout

- Log successful login with user info
- Log failed login attempts with error message
- Log logout events
- Capture IP address and user agent
- Include tenant context"
```

---

### Task 7: Run Migration and Test

**Files:**
- Migration files in `drizzle/`

**Step 1: Push migration to database**

Run: `bunx drizzle-kit push`

Expected: Database schema updated with new audit_logs columns and indexes

**Step 2: Verify table structure**

Run: `psql $DATABASE_URL -c "\d audit_logs"`

Expected: Table structure showing all new columns and indexes

**Step 3: Test basic logging**

Create test script: `src/lib/server/audit-logs/test.ts`

```typescript
import { logSuccess, logFailure, logWarning } from '$lib/server/audit-logs';

async function test() {
	console.log('Testing audit logs...');

	// Test success log
	await logSuccess('CREATE', 'USER', 'test-user-123', {
		userId: 'admin-123',
		tenantId: 'tenant-456',
		details: {
			before: null,
			after: { name: 'Test User', email: 'test@example.com' }
		}
	});
	console.log('✓ Success log created');

	// Test failure log
	await logFailure('LOGIN', 'USER', 'hacker@bad.com', 'Invalid password');
	console.log('✓ Failure log created');

	// Test warning log
	await logWarning('API_CALL', 'INTEGRATION', 'waha-123', 'Slow response', {
		details: { metadata: { responseTime: 5000 } }
	});
	console.log('✓ Warning log created');

	console.log('All tests passed!');
}

test();
```

Run: `bun run src/lib/server/audit-logs/test.ts`

Expected: All logs created successfully

**Step 4: Verify logs in database**

Run: `psql $DATABASE_URL -c "SELECT id, action, entity_type, severity, status, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5;"`

Expected: Show the 3 test logs we just created

**Step 5: Clean up test script**

Run: `rm src/lib/server/audit-logs/test.ts`

**Step 6: Commit migration**

```bash
git add drizzle/
git commit -m "chore: push audit logs migration to database

- Add new columns: tenant_id, user_id, entity_id, details, etc.
- Add indexes for performance
- Add enum types for action, entity_type, severity, status"
```

---

### Task 8: Update Navigation & Add Audit Logs Link

**Files:**
- Find and modify admin sidebar/navigation file

**Step 1: Find admin sidebar file**

Run: `find src/lib/components/admin -name "*sidebar*" -o -name "*nav*" | head -5`

Expected: Find sidebar component file

**Step 2: Add audit logs link to sidebar**

Modify the sidebar to add audit logs menu item:

```svelte
// Add this in the system section or as a new section
<a href="/admin/system/audit-logs" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
	<ShieldAlert class="h-5 w-5" />
	<span>{i18n.t('admin.auditLogs.title')}</span>
</a>
```

**Step 3: Commit**

```bash
git add src/lib/components/admin/
git commit -m "feat: add audit logs link to admin sidebar navigation"
```

---

## End of Phase 1

Phase 1 complete! The foundation is now in place:

✅ Database schema enhanced
✅ Logger helper functions created
✅ Query functions with pagination
✅ Basic UI with table and filters
✅ Login/logout logging integrated
✅ Navigation updated

---

## What's Next?

Ready for Phase 2 (Enhancement) or want to test Phase 1 first?

**Phase 2 will include:**
- Advanced filters (dropdowns for action, entity type, severity, status)
- Full-text search implementation
- Log detail modal with before/after JSON view
- CSV/Excel export functionality
- More logging integration points (CRUD operations, integrations)
