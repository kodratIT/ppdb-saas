import { db } from '$lib/server/db';
import { tenants, auditLogs, users, invoices } from '$lib/server/db/schema';
import { sql, eq, count } from 'drizzle-orm';

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
	await db
		.insert(auditLogs)
		.values({
			actorId,
			action: 'create_tenant',
			target: `tenant:${data.slug}`,
			details: JSON.stringify({ name: data.name, id: newTenant.id })
		})
		.returning();

	return newTenant;
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
	// Assuming invoices table exists based on previous context, even if not fully visible in recent snippet.
	// If invoices table doesn't exist in schema import, I should check schema again.
	// Based on schema read, invoices exists.
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
