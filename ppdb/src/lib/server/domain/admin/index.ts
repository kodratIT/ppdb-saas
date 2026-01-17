import { db } from '$lib/server/db';
import { tenants, auditLogs, users, invoices, applications } from '$lib/server/db/schema';
import { sql, eq, count, and, gte, desc, getTableColumns, ilike, or, asc } from 'drizzle-orm';
import { getCached, setCached, clearCache } from '$lib/server/cache';

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

	// Invalidate cache
	clearCache('tenants:');

	return newTenant;
}

export async function listTenantsWithStats(
	params: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	} = {}
) {
	const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;

	// Check cache
	const cacheKey = `tenants:list:${JSON.stringify({ page, limit, search, status, sortBy, sortOrder })}`;
	const cachedData = getCached<any>(cacheKey);
	if (cachedData) return cachedData;

	const offset = (page - 1) * limit;

	// 1. Build Where Clause
	const conditions = [];
	if (status && status !== 'all') {
		conditions.push(eq(tenants.status, status as 'active' | 'inactive'));
	}
	if (search) {
		conditions.push(or(ilike(tenants.name, `%${search}%`), ilike(tenants.slug, `%${search}%`)));
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// 2. Count Query
	const [totalResult] = await db.select({ count: count() }).from(tenants).where(whereClause);

	const total = Number(totalResult?.count || 0);

	// 3. Data Query with Aggregations
	const allowedSortColumns = {
		createdAt: tenants.createdAt,
		name: tenants.name,
		slug: tenants.slug,
		status: tenants.status
	};

	const sortColumn =
		allowedSortColumns[sortBy as keyof typeof allowedSortColumns] || tenants.createdAt;
	const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

	const data = await db
		.select({
			...getTableColumns(tenants),
			appCount: sql<number>`cast(count(distinct ${applications.id}) as integer)`,
			paidInvoices: sql<number>`cast(count(distinct case when ${invoices.status} = 'PAID' then ${invoices.id} end) as integer)`
		})
		.from(tenants)
		.leftJoin(applications, eq(tenants.id, applications.tenantId))
		.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
		.where(whereClause)
		.groupBy(tenants.id)
		.orderBy(orderBy)
		.limit(limit)
		.offset(offset);

	const result = {
		data: data.map((t) => ({
			...t,
			stats: {
				applications: t.appCount,
				paidInvoices: t.paidInvoices
			}
		})),
		total,
		page,
		totalPages: Math.ceil(total / limit)
	};

	// Save to cache
	setCached(cacheKey, result, 60); // Cache for 1 minute

	return result;
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

	// Invalidate cache
	clearCache('tenants:');
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

	// 3. New Registrations Today
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const [newUsersToday] = await db
		.select({ count: count() })
		.from(users)
		.where(and(eq(users.role, 'parent'), gte(users.createdAt, startOfToday)));

	// 4. Pending Verifications (Submitted status)
	const [pendingVerifications] = await db
		.select({ count: count() })
		.from(applications)
		.where(eq(applications.status, 'submitted'));

	// 5. Total Applications (for conversion rate)
	const [totalApplications] = await db.select({ count: count() }).from(applications);

	// 6. Total Invoices/Transactions (Paid)
	const [transactionsCount] = await db
		.select({ count: count() })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	// 7. Total Revenue (Sum of PAID invoices)
	const [revenueResult] = await db
		.select({ total: sql<number>`sum(${invoices.amount})` })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	// 8. Revenue Trend (Last 30 days)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const dailyRevenue = await db
		.select({
			date: sql<string>`DATE(${invoices.createdAt})`,
			amount: sql<number>`sum(${invoices.amount})`
		})
		.from(invoices)
		.where(and(eq(invoices.status, 'PAID'), gte(invoices.createdAt, thirtyDaysAgo)))
		.groupBy(sql`DATE(${invoices.createdAt})`)
		.orderBy(sql`DATE(${invoices.createdAt})`);

	// 9. Top Performing Schools
	const topSchools = await db
		.select({
			id: tenants.id,
			name: tenants.name,
			slug: tenants.slug,
			appCount: sql<number>`(SELECT count(*) FROM ${applications} WHERE ${applications.tenantId} = ${tenants.id})`,
			revenue: sql<number>`COALESCE(sum(CASE WHEN ${invoices.status} = 'PAID' THEN ${invoices.amount} ELSE 0 END), 0)`
		})
		.from(tenants)
		.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
		.groupBy(tenants.id, tenants.name, tenants.slug)
		.orderBy(
			desc(
				sql`COALESCE(sum(CASE WHEN ${invoices.status} = 'PAID' THEN ${invoices.amount} ELSE 0 END), 0)`
			)
		)
		.limit(5);

	const totalRevenue = revenueResult.total || 0;
	const activeTenantsCount = activeTenants.length;
	const averageRevenuePerSchool = activeTenantsCount > 0 ? totalRevenue / activeTenantsCount : 0;
	const conversionRate =
		totalApplications.count > 0 ? (transactionsCount.count / totalApplications.count) * 100 : 0;

	return {
		tenants: {
			total: allTenants.length,
			active: activeTenantsCount,
			list: allTenants.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)
		},
		users: {
			totalParents: usersCount.count,
			newRegistrationsToday: newUsersToday.count
		},
		applications: {
			pendingVerifications: pendingVerifications.count
		},
		financial: {
			totalTransactions: transactionsCount.count,
			totalRevenue,
			averageRevenuePerSchool,
			conversionRate,
			dailyRevenue,
			topSchools
		}
	};
}
