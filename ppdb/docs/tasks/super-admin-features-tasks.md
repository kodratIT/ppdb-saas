# 📋 SUPER ADMIN FEATURES DEVELOPMENT TASK LIST

**File:** `docs/tasks/super-admin-features-tasks.md`
**Created:** 2026-01-21
**Status:** Ready for Execution
**Priority:** High

---

## 🎯 Goal

Mengembangkan semua fitur Super Admin yang belum lengkap untuk mencapai 100% coverage Epic 1 dan FR requirements.

---

## 📊 CURRENT STATUS

### ✅ Already Implemented

| Feature                   | Location                           | Status  |
| ------------------------- | ---------------------------------- | ------- |
| Dashboard Overview        | `/admin`                           | ✅ Done |
| Organizations Management  | `/admin/schools`                   | ✅ Done |
| School Units              | `/admin/units`                     | ✅ Done |
| Announcements             | `/admin/announcements`             | ✅ Done |
| Support Tickets           | `/admin/tickets`                   | ✅ Done |
| Packages/Pricing          | `/admin/plans`                     | ✅ Done |
| Active Subscriptions      | `/admin/subscription/tenants`      | ✅ Done |
| Subscription Transactions | `/admin/subscription/transactions` | ✅ Done |
| **Payout Management**     | `/admin/payouts`                   | ✅ Done |
| Global Reports            | `/admin/reports`                   | ✅ Done |
| Platform Admins           | `/admin/users`                     | ✅ Done |
| Settings                  | `/admin/settings`                  | ✅ Done |

### ❌ Missing Features

| Feature                        | FR   | Priority | Status  |
| ------------------------------ | ---- | -------- | ------- |
| System Health Dashboard        | FR3  | High     | ⏳ Todo |
| Roles & Permissions Management | FR30 | High     | ⏳ Todo |
| Global Audit Logs Viewer       | FR28 | High     | ⏳ Todo |
| Impersonation Audit Trail      | -    | Medium   | ⏳ Todo |

---

## 📦 TASK LIST

### TASK 1: Create System Health Dashboard ⏱️ 4 jam

**FR Coverage:** FR3 - Super Admin dapat memantau kesehatan infrastruktur

**File:** `src/routes/admin/health/`

**Steps:**

#### 1.1 Create Integration Health Check Modules

```bash
# Create directory
mkdir -p src/lib/server/integrations

# Create WAHA integration
code src/lib/server/integrations/waha.ts
```

**Content:** `src/lib/server/integrations/waha.ts`

```typescript
export interface HealthCheckResult {
	status: 'healthy' | 'degraded' | 'error';
	latency: number;
	message?: string;
}

export async function checkWahaHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	try {
		const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
		const response = await fetch(`${wahaUrl}/api/health`, {
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		});
		const latency = Date.now() - start;
		if (response.ok) {
			return { status: 'healthy', latency, message: 'WAHA is operational' };
		}
		return { status: 'degraded', latency, message: `Status ${response.status}` };
	} catch (error) {
		return {
			status: 'error',
			latency: Date.now() - start,
			message: error instanceof Error ? error.message : 'Connection failed'
		};
	}
}
```

```bash
# Create Xendit integration
code src/lib/server/integrations/xendit.ts
```

**Content:** `src/lib/server/integrations/xendit.ts`

```typescript
export interface HealthCheckResult {
	status: 'healthy' | 'degraded' | 'error';
	latency: number;
	message?: string;
}

export async function checkXenditHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	try {
		const secret = process.env.XENDIT_SECRET_KEY;
		if (!secret) {
			return { status: 'degraded', latency: 0, message: 'API key not configured' };
		}
		const response = await fetch('https://api.xendit.co/balance', {
			method: 'GET',
			headers: { Authorization: `Basic ${btoa(secret + ':')}` },
			signal: AbortSignal.timeout(5000)
		});
		const latency = Date.now() - start;
		if (response.ok) {
			return { status: 'healthy', latency, message: 'Xendit is operational' };
		}
		return { status: 'degraded', latency, message: `Status ${response.status}` };
	} catch (error) {
		return {
			status: 'error',
			latency: Date.now() - start,
			message: error instanceof Error ? error.message : 'Connection failed'
		};
	}
}
```

#### 1.2 Create Health Dashboard Server Load

```bash
# Create health directory
mkdir -p src/routes/admin/health

# Create server load file
code src/routes/admin/health/+page.server.ts
```

**Content:** `src/routes/admin/health/+page.server.ts`

```typescript
import { db } from '$lib/server/db';
import { tenants, users, applications, invoices } from '$lib/server/db/schema';
import { sql, eq, gte } from 'drizzle-orm';
import { checkWahaHealth } from '$lib/server/integrations/waha';
import { checkXenditHealth } from '$lib/server/integrations/xendit';

export async function load() {
	const now = new Date();
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

	// Server metrics
	const serverMetrics = {
		uptime: Math.floor(process.uptime() / 60), // minutes
		memoryUsage: {
			heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
			rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
		}
	};

	// Database health
	let dbHealth = { status: 'unknown' as const, latency: 0, error: null as string | null };
	try {
		const start = Date.now();
		const [result] = await db.select({ count: sql<number>`count(*)` }).from(tenants);
		dbHealth = { status: 'healthy', latency: Date.now() - start, error: null };
	} catch (e) {
		dbHealth = { status: 'error', latency: 0, error: e instanceof Error ? e.message : 'Unknown' };
	}

	// External integrations
	const [wahaHealth, xenditHealth] = await Promise.all([checkWahaHealth(), checkXenditHealth()]);

	// Platform stats
	const [totalTenants, activeTenants, totalUsers] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(tenants),
		db
			.select({ count: sql<number>`count(*)` })
			.from(tenants)
			.where(eq(tenants.status, 'active')),
		db.select({ count: sql<number>`count(*)` }).from(users)
	]);

	const [newUsersToday, newAppsToday, transactionsToday] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(gte(users.createdAt, oneDayAgo)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(applications)
			.where(gte(applications.createdAt, oneDayAgo)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(invoices)
			.where(and(eq(invoices.status, 'PAID'), gte(invoices.updatedAt, oneDayAgo)))
	]);

	// Calculate overall status
	const allHealthy =
		dbHealth.status === 'healthy' &&
		wahaHealth.status === 'healthy' &&
		xenditHealth.status === 'healthy';
	const status = allHealthy ? 'operational' : 'degraded';

	return {
		server: serverMetrics,
		database: dbHealth,
		integrations: { waha: wahaHealth, xendit: xenditHealth },
		platform: {
			tenants: { total: Number(totalTenants.count), active: Number(activeTenants.count) },
			users: { total: Number(totalUsers.count), newToday: Number(newUsersToday.count) },
			applications: { newToday: Number(newAppsToday.count) },
			transactions: { today: Number(transactionsToday.count) }
		},
		status,
		timestamp: now.toISOString()
	};
}
```

#### 1.3 Create Health Dashboard UI

```bash
# Create Svelte page
code src/routes/admin/health/+page.svelte
```

**Content:** `src/routes/admin/health/+page.svelte`

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Activity, Server, Database, Wifi, WifiOff, Cpu, HardDrive, Zap } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props<{ data: PageData }>();

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'healthy':
			case 'operational':
				return 'bg-green-100 text-green-700';
			case 'degraded':
				return 'bg-yellow-100 text-yellow-700';
			case 'error':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'healthy':
			case 'operational':
				return Wifi;
			case 'degraded':
				return Activity;
			case 'error':
				return WifiOff;
			default:
				return Server;
		}
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">System Health</h1>
			<p class="text-muted-foreground mt-1">Monitor infrastructure and platform health.</p>
		</div>
		<Badge class={getStatusColor(data.status)} variant="outline">
			{data.status.toUpperCase()}
		</Badge>
	</div>

	<!-- Overall Status -->
	<div class="grid gap-4 md:grid-cols-4 mb-8">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					System Status
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold capitalize">{data.status}</div>
				<p class="text-xs text-muted-foreground">
					Last checked: {new Date(data.timestamp).toLocaleTimeString()}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Server Uptime
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Cpu class="h-5 w-5 text-blue-500" />
					<div class="text-2xl font-bold">{data.server.uptime}m</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Memory Usage
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<HardDrive class="h-5 w-5 text-purple-500" />
					<div class="text-2xl font-bold">{data.server.memoryUsage.heapUsed}MB</div>
				</div>
				<p class="text-xs text-muted-foreground">of {data.server.memoryUsage.heapTotal}MB heap</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Database
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Database class="h-5 w-5 text-green-500" />
					<div class="text-2xl font-bold capitalize">{data.database.status}</div>
				</div>
				<p class="text-xs text-muted-foreground">{data.database.latency}ms latency</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Integrations -->
	<div class="grid gap-4 md:grid-cols-3 mb-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Zap class="h-5 w-5 text-yellow-500" />
					WAHA (WhatsApp)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between">
					<Badge class={getStatusColor(data.integrations.waha.status)} variant="outline">
						{data.integrations.waha.status.toUpperCase()}
					</Badge>
					<span class="text-sm text-muted-foreground">{data.integrations.waha.latency}ms</span>
				</div>
				<p class="text-xs text-muted-foreground mt-2">{data.integrations.waha.message}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Activity class="h-5 w-5 text-blue-500" />
					Xendit (Payment)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between">
					<Badge class={getStatusColor(data.integrations.xendit.status)} variant="outline">
						{data.integrations.xendit.status.toUpperCase()}
					</Badge>
					<span class="text-sm text-muted-foreground">{data.integrations.xendit.latency}ms</span>
				</div>
				<p class="text-xs text-muted-foreground mt-2">{data.integrations.xendit.message}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Platform Stats</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span>Active Tenants:</span>
						<span class="font-semibold"
							>{data.platform.tenants.active}/{data.platform.tenants.total}</span
						>
					</div>
					<div class="flex justify-between">
						<span>Total Users:</span>
						<span class="font-semibold">{data.platform.users.total}</span>
					</div>
					<div class="flex justify-between">
						<span>Transactions Today:</span>
						<span class="font-semibold">{data.platform.transactions.today}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
```

#### 1.4 Update Sidebar

```bash
# Edit DashboardSidebar.svelte
code src/lib/components/admin/DashboardSidebar.svelte
```

**Add to navigation array:**

```typescript
{
  group: 'System',
  items: [
    // ... existing items
    { name: 'Health Monitor', icon: Activity, href: '/admin/health' },
  ]
}
```

**Validation:**

- [ ] Health dashboard loads at `/admin/health`
- [ ] Shows server uptime, memory, CPU
- [ ] Shows database connection status
- [ ] Shows WAHA and Xendit integration status
- [ ] Shows platform statistics
- [ ] Sidebar updated with Health Monitor link

---

### TASK 2: Create Roles & Permissions Management ⏱️ 5 jam

**FR Coverage:** FR30 - Super Admin dapat mengelola definisi Roles dan matriks Permissions

**File:** `src/routes/admin/roles/`

**Steps:**

#### 2.1 Create Permissions Domain Logic

```bash
# Create directory
mkdir -p src/routes/admin/roles

# Create server load
code src/routes/admin/roles/+page.server.ts
```

**Content:** `src/routes/admin/roles/+page.server.ts`

```typescript
import { db } from '$lib/server/db';
import { users, tenants } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Require super admin
	if (!locals.session || locals.session.role !== 'super_admin') {
		throw new Error('Unauthorized');
	}

	// Get all platform users with their roles
	const allUsers = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			status: users.status,
			tenantName: tenants.name,
			createdAt: users.createdAt
		})
		.from(users)
		.leftJoin(tenants, eq(users.tenantId, tenants.id))
		.orderBy(desc(users.createdAt));

	// Role statistics
	const roleStats = await db
		.select({
			role: users.role,
			count: sql<number>`count(*)`
		})
		.from(users)
		.groupBy(users.role);

	return {
		users: allUsers,
		roleStats: roleStats.map((r) => ({ role: r.role, count: Number(r.count) }))
	};
};

export const actions: Actions = {
	updateRole: async ({ request, locals }) => {
		if (!locals.session || locals.session.role !== 'super_admin') {
			throw new Error('Unauthorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const newRole = formData.get('role')?.toString();

		if (!userId || !newRole) {
			return { error: 'Missing required fields' };
		}

		await db
			.update(users)
			.set({ role: newRole as any, updatedAt: new Date() })
			.where(eq(users.id, userId));

		return { success: true };
	},

	updateStatus: async ({ request, locals }) => {
		if (!locals.session || locals.session.role !== 'super_admin') {
			throw new Error('Unauthorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const newStatus = formData.get('status')?.toString();

		if (!userId || !newStatus) {
			return { error: 'Missing required fields' };
		}

		await db
			.update(users)
			.set({ status: newStatus as any, updatedAt: new Date() })
			.where(eq(users.id, userId));

		return { success: true };
	}
};
```

#### 2.2 Create Roles Management UI

```bash
code src/routes/admin/roles/+page.svelte
```

**Content:** `src/routes/admin/roles/+page.svelte`

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { Shield, Users, UserCog, Eye, EyeOff } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const roles = [
		'super_admin',
		'school_admin',
		'verifier',
		'treasurer',
		'interviewer',
		'field_officer',
		'parent'
	];
	const statuses = ['active', 'inactive', 'pending'];

	const getRoleBadgeStyle = (role: string) => {
		switch (role) {
			case 'super_admin':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			case 'school_admin':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'verifier':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'treasurer':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
			<p class="text-muted-foreground mt-1">Manage platform roles and user permissions.</p>
		</div>
	</div>

	<!-- Role Statistics -->
	<div class="grid gap-4 md:grid-cols-4 mb-8">
		{#each data.roleStats as stat}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						{stat.role.replace('_', ' ')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stat.count}</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Users Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Platform Users</Card.Title>
			<Card.Description>Manage user roles and access permissions.</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>User</Table.Head>
						<Table.Head>Organization</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Joined</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">{user.name || 'N/A'}</div>
								<div class="text-xs text-muted-foreground">{user.email}</div>
							</Table.Cell>
							<Table.Cell>{user.tenantName || 'N/A'}</Table.Cell>
							<Table.Cell>
								<form action="?/updateRole" method="POST" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<select
										name="role"
										class="text-sm border rounded px-2 py-1 {getRoleBadgeStyle(user.role)}"
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
									>
										{#each roles as role}
											<option value={role} selected={role === user.role}>
												{role.replace('_', ' ')}
											</option>
										{/each}
									</select>
								</form>
							</Table.Cell>
							<Table.Cell>
								<form action="?/updateStatus" method="POST" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<select
										name="status"
										class="text-sm border rounded px-2 py-1"
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
									>
										{#each statuses as status}
											<option value={status} selected={status === user.status}>{status}</option>
										{/each}
									</select>
								</form>
							</Table.Cell>
							<Table.Cell class="text-sm text-muted-foreground">
								{new Date(user.createdAt).toLocaleDateString()}
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="sm">View Details</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
```

#### 2.3 Update Sidebar

**Add to navigation:**

```typescript
{ name: 'Roles & Permissions', icon: Shield, href: '/admin/roles' }
```

**Validation:**

- [ ] Roles page loads at `/admin/roles`
- [ ] Shows all platform users
- [ ] Can update user roles
- [ ] Can update user status
- [ ] Shows role statistics
- [ ] Sidebar updated

---

### TASK 3: Create Global Audit Logs Viewer ⏱️ 4 jam

**FR Coverage:** FR28 - Sistem mencatat setiap perubahan data sensitif dalam log audit

**File:** `src/routes/admin/audit-logs/`

**Steps:**

#### 3.1 Create Audit Logs Server Load

```bash
# Create directory
mkdir -p src/routes/admin/audit-logs

# Create server load
code src/routes/admin/audit-logs/+page.server.ts
```

**Content:** `src/routes/admin/audit-logs/+page.server.ts`

```typescript
import { db } from '$lib/server/db';
import { auditLogs, users, tenants } from '$lib/server/db/schema';
import { eq, desc, and, like, gte, lte } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.session || locals.session.role !== 'super_admin') {
		throw new Error('Unauthorized');
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 50;
	const offset = (page - 1) * limit;

	const action = url.searchParams.get('action') || '';
	const actorId = url.searchParams.get('actor') || '';
	const dateFrom = url.searchParams.get('from') || '';
	const dateTo = url.searchParams.get('to') || '';

	// Build filters
	const conditions = [];
	if (action) conditions.push(like(auditLogs.action, `%${action}%`));
	if (actorId) conditions.push(eq(auditLogs.actorId, actorId));
	if (dateFrom) conditions.push(gte(auditLogs.createdAt, new Date(dateFrom)));
	if (dateTo) conditions.push(lte(auditLogs.createdAt, new Date(dateTo)));

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	// Get logs
	const logs = await db
		.select({
			id: auditLogs.id,
			action: auditLogs.action,
			target: auditLogs.target,
			details: auditLogs.details,
			ipAddress: sql<string>`'N/A'`.as('ipAddress'),
			createdAt: auditLogs.createdAt,
			actorEmail: users.email,
			actorName: users.name,
			tenantName: tenants.name
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.actorId, users.id))
		.leftJoin(tenants, eq(users.tenantId, tenants.id))
		.where(where)
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(auditLogs)
		.where(where);

	// Get unique actions for filter
	const [actions] = await db
		.selectDistinct({ action: auditLogs.action })
		.from(auditLogs)
		.orderBy(auditLogs.action);

	return {
		logs,
		pagination: {
			page,
			limit,
			total: Number(totalCount.count),
			totalPages: Math.ceil(Number(totalCount.count) / limit)
		},
		filters: { action, actorId, dateFrom, dateTo }
	};
};

export const actions: Actions = {
	// Future: export logs, delete old logs, etc.
};
```

#### 3.2 Create Audit Logs UI

```bash
code src/routes/admin/audit-logs/+page.svelte
```

**Content:** `src/routes/admin/audit-logs/+page.svelte`

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { FileText, Calendar, User, Filter, Download } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const getActionColor = (action: string) => {
		if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-700';
		if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700';
		if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700';
		if (action.includes('login') || action.includes('auth')) return 'bg-purple-100 text-purple-700';
		return 'bg-gray-100 text-gray-700';
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Audit Logs</h1>
			<p class="text-muted-foreground mt-1">View all administrative actions and system events.</p>
		</div>
		<Button variant="outline">
			<Download class="mr-2 h-4 w-4" />
			Export Logs
		</Button>
	</div>

	<!-- Filters -->
	<Card.Root class="mb-6">
		<Card.Header class="pb-3">
			<Card.Title class="text-sm font-medium flex items-center gap-2">
				<Filter class="h-4 w-4" />
				Filters
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<form class="flex gap-4 flex-wrap">
				<div class="space-y-1">
					<label class="text-xs text-muted-foreground">Action Type</label>
					<select name="action" class="border rounded px-3 py-2 text-sm">
						<option value="">All Actions</option>
						{#each ['create_tenant', 'delete_tenant', 'update_tenant_status', 'login', 'logout', 'update_role'] as act}
							<option value={act} selected={data.filters.action === act}
								>{act.replace('_', ' ')}</option
							>
						{/each}
					</select>
				</div>
				<div class="space-y-1">
					<label class="text-xs text-muted-foreground">From Date</label>
					<input
						type="date"
						name="from"
						class="border rounded px-3 py-2 text-sm"
						value={data.filters.dateFrom}
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs text-muted-foreground">To Date</label>
					<input
						type="date"
						name="to"
						class="border rounded px-3 py-2 text-sm"
						value={data.filters.dateTo}
					/>
				</div>
				<div class="flex items-end">
					<Button type="submit" size="sm">Apply Filters</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Stats -->
	<div class="grid gap-4 md:grid-cols-4 mb-6">
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-2xl font-bold">{data.pagination.total}</div>
				<p class="text-xs text-muted-foreground">Total Logs</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-2xl font-bold">{data.pagination.page}</div>
				<p class="text-xs text-muted-foreground">Current Page</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-2xl font-bold">{data.pagination.totalPages}</div>
				<p class="text-xs text-muted-foreground">Total Pages</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Logs Table -->
	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Timestamp</Table.Head>
						<Table.Head>Actor</Table.Head>
						<Table.Head>Action</Table.Head>
						<Table.Head>Target</Table.Head>
						<Table.Head>Details</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.logs as log}
						<Table.Row>
							<Table.Cell class="text-xs text-muted-foreground whitespace-nowrap">
								{new Date(log.createdAt).toLocaleString()}
							</Table.Cell>
							<Table.Cell>
								<div class="font-medium text-sm">{log.actorName || 'System'}</div>
								<div class="text-xs text-muted-foreground">{log.actorEmail || 'N/A'}</div>
							</Table.Cell>
							<Table.Cell>
								<Badge class={getActionColor(log.action)} variant="outline">
									{log.action.replace('_', ' ')}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-sm">{log.target}</Table.Cell>
							<Table.Cell class="text-xs text-muted-foreground max-w-xs truncate">
								{log.details || '-'}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Pagination -->
	<div class="flex justify-center gap-2 mt-6">
		{#each Array(data.pagination.totalPages) as _, i}
			<Button
				variant={data.pagination.page === i + 1 ? 'default' : 'outline'}
				size="sm"
				href="?page={i + 1}"
			>
				{i + 1}
			</Button>
		{/each}
	</div>
</div>
```

#### 3.3 Update Sidebar

**Add to navigation:**

```typescript
{ name: 'Audit Logs', icon: FileText, href: '/admin/audit-logs' }
```

**Validation:**

- [ ] Audit logs page loads at `/admin/audit-logs`
- [ ] Shows all audit logs with pagination
- [ ] Can filter by action type, date range
- [ ] Shows actor, action, target, details
- [ ] Sidebar updated

---

### TASK 4: Create Impersonation Audit Trail ⏱️ 3 jam

**File:** `src/lib/server/auth/impersonation.ts` dan `src/routes/admin/impersonate/`

**Steps:**

#### 4.1 Create Impersonation Domain Logic

```bash
code src/lib/server/auth/impersonation.ts
```

**Content:** `src/lib/server/auth/impersonation.ts`

```typescript
import { db } from '$lib/server/db';
import { auditLogs, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface ImpersonationSession {
	id: string;
	impersonatorId: string;
	impersonatedId: string;
	tenantId: string;
	startedAt: Date;
	endedAt?: Date;
	ipAddress?: string;
	userAgent?: string;
}

export async function startImpersonation(
	impersonatorId: string,
	impersonatedId: string,
	tenantId: string,
	ipAddress?: string,
	userAgent?: string
): Promise<ImpersonationSession> {
	// Create impersonation session
	const sessionId = crypto.randomUUID();

	// Log the impersonation start
	await db.insert(auditLogs).values({
		actorId: impersonatorId,
		action: 'impersonation_start',
		target: `user:${impersonatedId}`,
		details: JSON.stringify({
			sessionId,
			impersonatedEmail: 'N/A', // Will be populated by query
			ipAddress,
			userAgent
		})
	});

	return {
		id: sessionId,
		impersonatorId,
		impersonatedId,
		tenantId,
		startedAt: new Date(),
		ipAddress,
		userAgent
	};
}

export async function stopImpersonation(
	sessionId: string,
	impersonatorId: string,
	impersonatedId: string
): Promise<void> {
	// Log the impersonation end
	await db.insert(auditLogs).values({
		actorId: impersonatorId,
		action: 'impersonation_end',
		target: `user:${impersonatedId}`,
		details: JSON.stringify({
			sessionId,
			duration: 'tracked'
		})
	});
}

export async function getImpersonationHistory(limit = 50) {
	const logs = await db
		.select({
			id: auditLogs.id,
			action: auditLogs.action,
			target: auditLogs.target,
			details: auditLogs.details,
			createdAt: auditLogs.createdAt,
			actorEmail: users.email,
			actorName: users.name
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.actorId, users.id))
		.where(sql`${auditLogs.action} LIKE 'impersonation_%'`)
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit);

	return logs;
}
```

#### 4.2 Update Impersonate Endpoints

```bash
# Update start impersonate endpoint
code src/routes/admin/impersonate/[tenantId]/+page.server.ts
```

**Add to existing file:**

```typescript
import { startImpersonation, stopImpersonation } from '$lib/server/auth/impersonation';

export const actions = {
	default: async ({ params, locals, request }) => {
		if (!locals.session || locals.session.role !== 'super_admin') {
			throw new Error('Unauthorized');
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const action = formData.get('action')?.toString();

		if (action === 'start' && userId) {
			const ipAddress = request.headers.get('cf-connecting-ip') || 'unknown';
			const userAgent = request.headers.get('user-agent') || 'unknown';

			await startImpersonation(locals.userId, userId, params.tenantId, ipAddress, userAgent);

			// Set impersonation cookie
			cookies.set('impersonator_session_id', locals.session.id, { path: '/' });

			return { success: true, message: 'Impersonation started' };
		}

		if (action === 'stop') {
			const impersonatorSessionId = cookies.get('impersonator_session_id');
			if (impersonatorSessionId) {
				await stopImpersonation(impersonatorSessionId, locals.userId, userId || locals.userId);
				cookies.delete('impersonator_session_id', { path: '/' });
			}

			return { success: true, message: 'Impersonation stopped' };
		}

		return { error: 'Invalid action' };
	}
};
```

#### 4.3 Create Impersonation History Page (Optional)

```bash
code src/routes/admin/impersonate/history/+page.server.ts
```

**Content:** Similar to audit logs but filtered for impersonation actions.

**Validation:**

- [ ] Impersonation starts are logged
- [ ] Impersonation ends are logged
- [ ] IP address and user agent are captured
- [ ] Can be viewed in Audit Logs

---

### TASK 5: Update Sidebar Navigation ⏱️ 30 menit

**File:** `src/lib/components/admin/DashboardSidebar.svelte`

**Update navigation array:**

```typescript
const baseNavigation = [
	{
		group: 'Main',
		items: [{ name: 'Dashboard', icon: LayoutDashboard, href: '/admin' }]
	},
	{
		group: 'Management',
		items: [
			{ name: 'Organizations', icon: Building2, href: '/admin/schools' },
			{ name: 'School Units', icon: School, href: '/admin/units' },
			{ name: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
			{ name: 'Support Tickets', icon: Ticket, href: '/admin/tickets' }
		]
	},
	{
		group: 'Subscription',
		items: [
			{ name: 'Packages', icon: Package, href: '/admin/plans' },
			{ name: 'Active Subs', icon: Users, href: '/admin/subscription/tenants' },
			{ name: 'Transactions', icon: FileText, href: '/admin/subscription/transactions' },
			{ name: 'Payouts', icon: CreditCard, href: '/admin/payouts' }
		]
	},
	{
		group: 'Analytics',
		items: [{ name: 'Global Reports', icon: LineChart, href: '/admin/reports' }]
	},
	{
		group: 'System',
		items: [
			{ name: 'Platform Admins', icon: UserCog, href: '/admin/users' },
			{ name: 'Roles & Permissions', icon: Shield, href: '/admin/roles' }, // NEW
			{ name: 'Health Monitor', icon: Activity, href: '/admin/health' }, // NEW
			{ name: 'Audit Logs', icon: FileText, href: '/admin/audit-logs' }, // NEW
			{ name: 'Settings', icon: Settings, href: '/admin/settings' }
		]
	}
];
```

---

## 📊 PROGRESS TRACKING

| Task                         | Status | Effort   |
| ---------------------------- | ------ | -------- |
| 1. System Health Dashboard   | ☐      | 4 jam    |
| 2. Roles & Permissions       | ☐      | 5 jam    |
| 3. Global Audit Logs         | ☐      | 4 jam    |
| 4. Impersonation Audit Trail | ☐      | 3 jam    |
| 5. Update Sidebar            | ☐      | 30 menit |

**Total Effort: ~16.5 jam**

---

## 📁 FILES SUMMARY

### New Files to CREATE:

| File                                          | Purpose                      |
| --------------------------------------------- | ---------------------------- |
| `src/lib/server/integrations/waha.ts`         | WAHA health check            |
| `src/lib/server/integrations/xendit.ts`       | Xendit health check          |
| `src/routes/admin/health/+page.server.ts`     | Health dashboard server load |
| `src/routes/admin/health/+page.svelte`        | Health dashboard UI          |
| `src/routes/admin/roles/+page.server.ts`      | Roles management server load |
| `src/routes/admin/roles/+page.svelte`         | Roles management UI          |
| `src/routes/admin/audit-logs/+page.server.ts` | Audit logs server load       |
| `src/routes/admin/audit-logs/+page.svelte`    | Audit logs UI                |
| `src/lib/server/auth/impersonation.ts`        | Impersonation domain logic   |

### Files to MODIFY:

| File                                                      | Change             |
| --------------------------------------------------------- | ------------------ |
| `src/lib/components/admin/DashboardSidebar.svelte`        | Add new menu items |
| `src/routes/admin/impersonate/[tenantId]/+page.server.ts` | Add audit logging  |

---

## 🧪 TESTING CHECKLIST

After completing all tasks:

```bash
# 1. Navigate to /admin/health
# Expected: Health dashboard loads with all metrics

# 2. Navigate to /admin/roles
# Expected: Roles management page loads

# 3. Navigate to /admin/audit-logs
# Expected: Audit logs viewer loads with filters

# 4. Test impersonation flow
# Expected: All actions logged in audit logs

# 5. Check sidebar navigation
# Expected: All new menu items present and working
```

---

## 📚 REFERENCE

| Resource          | Link                                     |
| ----------------- | ---------------------------------------- |
| SvelteKit Actions | https://kit.svelte.dev/docs/form-actions |
| Drizzle ORM       | https://orm.drizzle.team/docs/select     |
| Shadcn/UI         | https://ui.shadcn.com                    |

---

**Happy Coding, Bos! 🚀**
