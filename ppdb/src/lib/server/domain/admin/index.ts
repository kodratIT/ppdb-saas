import { db } from '$lib/server/db';
import { tenants, auditLogs, users, invoices, applications } from '$lib/server/db/schema';
import { sql, eq, count, and } from 'drizzle-orm';

export async function createTenant(data: { name: string; slug: string }, actorId: string) {
	const reserved = ['www', 'app', 'api', 'admin', 'super-admin'];
	if (reserved.includes(data.slug)) {
		throw new Error('Reserved slug');
	}

	const [newTenant] = await db
		.insert(tenants)
		.values({
			name: data.name,
			slug: data.slug,
			status: 'active'
		})
		.returning();

	// Create Audit Log
	await db.insert(auditLogs).values({
		actorId,
		action: 'create_tenant',
		target: `tenant:${data.slug}`,
		details: JSON.stringify({ name: data.name, id: newTenant.id })
	});

	return newTenant;
}

export async function listTenantsWithStats() {
	// Fetch all tenants
	const allTenants = await db.select().from(tenants);

	// Enrich with stats
	const enrichedTenants = await Promise.all(
		allTenants.map(async (tenant) => {
			const [appCount] = await db
				.select({ count: count() })
				.from(applications)
				.where(eq(applications.tenantId, tenant.id));

			const [paidInvoices] = await db
				.select({ count: count() })
				.from(invoices)
				.where(and(eq(invoices.tenantId, tenant.id), eq(invoices.status, 'PAID')));

			return {
				...tenant,
				stats: {
					applications: appCount.count,
					paidInvoices: paidInvoices.count
				}
			};
		})
	);

	return enrichedTenants;
}

export async function updateTenantStatus(
	tenantId: string,
	status: 'active' | 'inactive',
	actorId: string
) {
	await db.update(tenants).set({ status, updatedAt: new Date() }).where(eq(tenants.id, tenantId));

	await db.insert(auditLogs).values({
		actorId,
		action: 'update_tenant_status',
		target: `tenant:${tenantId}`,
		details: JSON.stringify({ status })
	});
}

export async function listTenants() {
	return await db.select().from(tenants);
}

export async function getDashboardStats() {
	// 1. Total Tenants & Active
	const allTenants = await db.select().from(tenants);
	const activeTenants = allTenants.filter((t) => t.status === 'active');

	// 2. Total Users (Parents)
	const [usersCount] = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.role, 'parent'));

	// 3. Total Invoices/Transactions (Paid)
	const [transactionsCount] = await db
		.select({ count: count() })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	// 4. Total Revenue (Sum of PAID invoices)
	const [revenueResult] = await db
		.select({ total: sql<number>`sum(${invoices.amount})` })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	return {
		tenants: {
			total: allTenants.length,
			active: activeTenants.length,
			list: allTenants.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5) // Recent 5
		},
		users: {
			totalParents: usersCount.count
		},
		financial: {
			totalTransactions: transactionsCount.count,
			totalRevenue: revenueResult.total || 0
		}
	};
}
