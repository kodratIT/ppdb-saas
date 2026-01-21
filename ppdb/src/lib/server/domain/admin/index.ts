import { db } from '$lib/server/db';
import {
	tenants,
	schoolProfiles,
	admissionPaths,
	feeStructures,
	customFields,
	applications,
	applicationDocuments,
	users,
	auditLogs,
	units,
	invoices,
	paymentTransactions,
	paymentProofs,
	broadcasts,
	selectionResults,
	homeVisitReports
} from '$lib/server/db/schema';
import { eq, sql, desc, or, ilike, and, getTableColumns, gte } from 'drizzle-orm';
import { clearCache, getCached, setCached } from '$lib/server/cache';

export async function createTenant(
	// ...
	data: {
		name: string;
		slug: string;
		type?: 'single' | 'foundation';
		npsn?: string;
		level?: string;
		status?: 'active' | 'inactive';
		// Location data
		province?: string;
		city?: string;
		district?: string;
		village?: string;
		address?: string;
		postalCode?: string;
	},
	actorId: string
) {
	const reserved = ['www', 'app', 'api', 'admin', 'super-admin'];
	if (reserved.includes(data.slug)) {
		throw new Error('Reserved slug');
	}

	// Use transaction to ensure atomicity
	return await db.transaction(async (tx: any) => {
		// 1. Insert tenant
		const [newTenant] = await tx
			.insert(tenants)
			.values({
				name: data.name,
				slug: data.slug,
				type: data.type || 'single',
				status: data.status || 'active'
			})
			.returning();

		// 2. Insert school profile with location data
		await tx.insert(schoolProfiles).values({
			tenantId: newTenant.id,
			name: data.name,
			npsn: data.npsn,
			schoolLevel: data.level,
			// Location fields
			province: data.province,
			city: data.city,
			district: data.district,
			address: data.address,
			postalCode: data.postalCode
		});

		// 3. Create default unit
		await tx.insert(units).values({
			tenantId: newTenant.id,
			name: data.name,
			level: (data.level || 'Lainnya') as any, // Cast to schoolLevelEnum
			config: {}
		});

		// 4. Create Audit Log
		await tx.insert(auditLogs).values({
			actorId,
			action: 'create_tenant',
			target: `tenant:${data.slug}`,
			details: JSON.stringify({
				name: data.name,
				id: newTenant.id,
				type: data.type,
				npsn: data.npsn,
				level: data.level
			})
		});

		// Invalidate cache
		clearCache('tenants:');

		return newTenant;
	});
}

/**
 * Delete a tenant and its associated data
 */
export async function deleteTenant(tenantId: string, actorId: string) {
	// Use transaction to ensure all associated data is deleted or nothing is
	return await db.transaction(async (tx: any) => {
		// 1. Check if there are any applications across units
		const [appCount] = await tx
			.select({ val: sql`count(*)` })
			.from(applications)
			.where(eq(applications.tenantId, tenantId));

		if (Number(appCount?.val || 0) > 0) {
			throw new Error('Cannot delete school with existing pendaftar (applications)');
		}

		// 2. Delete associated units
		await tx.delete(units).where(eq(units.tenantId, tenantId));

		// 3. Delete school profiles
		await tx.delete(schoolProfiles).where(eq(schoolProfiles.tenantId, tenantId));

		// 4. Delete associated users (except the actor if they belong here)
		// We avoid deleting the current actor if they are tied to this tenant
		await tx.delete(users).where(eq(users.tenantId, tenantId));

		// 5. Delete other related tables
		await tx.delete(admissionPaths).where(eq(admissionPaths.tenantId, tenantId));
		await tx.delete(feeStructures).where(eq(feeStructures.tenantId, tenantId));
		await tx.delete(customFields).where(eq(customFields.tenantId, tenantId));
		await tx.delete(invoices).where(eq(invoices.tenantId, tenantId));
		await tx.delete(paymentTransactions).where(eq(paymentTransactions.tenantId, tenantId));
		await tx.delete(paymentProofs).where(eq(paymentProofs.tenantId, tenantId));
		await tx.delete(broadcasts).where(eq(broadcasts.tenantId, tenantId));
		await tx.delete(selectionResults).where(eq(selectionResults.tenantId, tenantId));
		await tx.delete(homeVisitReports).where(eq(homeVisitReports.tenantId, tenantId));

		// 6. Delete the tenant itself
		const [deleted] = await tx.delete(tenants).where(eq(tenants.id, tenantId)).returning();

		// 7. Create Audit Log (INSIDE transaction)
		await tx.insert(auditLogs).values({
			actorId,
			action: 'delete_tenant',
			target: `tenant:${tenantId}`,
			details: JSON.stringify({
				id: tenantId,
				name: deleted?.name
			})
		});

		clearCache('tenants:');
		return deleted;
	});
}

export async function listTenantsWithStats(
	params: {
		page?: number;
		limit?: number;
		search?: string;
		searchField?: 'all' | 'name' | 'slug';
		searchOperator?: 'contains' | 'starts_with' | 'exact';
		status?: string;
		type?: string;
		timeframe?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	} = {}
) {
	const {
		page = 1,
		limit = 20,
		search,
		searchField = 'all',
		searchOperator = 'contains',
		status,
		type,
		timeframe,
		sortBy = 'createdAt',
		sortOrder = 'desc'
	} = params;

	// Check cache
	const cacheKey = `tenants:list:${JSON.stringify({ page, limit, search, searchField, searchOperator, status, type, timeframe, sortBy, sortOrder })}`;
	const cached = await getCached<any>(cacheKey);
	if (cached) return cached;

	// Build filter
	const conditions = [];
	if (search) {
		const term = searchOperator === 'exact' ? search : searchOperator === 'starts_with' ? `${search}%` : `%${search}%`;
		const comparator = searchOperator === 'exact' ? eq : ilike;

		if (searchField === 'all') {
			conditions.push(or(comparator(tenants.name, term), comparator(tenants.slug, term)));
		} else if (searchField === 'name') {
			conditions.push(comparator(tenants.name, term));
		} else if (searchField === 'slug') {
			conditions.push(comparator(tenants.slug, term));
		}
	}
	if (status && status !== 'all') {
		conditions.push(eq(tenants.status, status as any));
	}
	if (type && type !== 'all') {
		conditions.push(eq(tenants.type, type as any));
	}
	if (timeframe === 'week') {
		conditions.push(gte(tenants.createdAt, sql`NOW() - INTERVAL '7 days'`));
	} else if (timeframe === 'month') {
		conditions.push(gte(tenants.createdAt, sql`NOW() - INTERVAL '30 days'`));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	// 1. Get main data with counts in one query
	const data = await db
		.select({
			...getTableColumns(tenants),
			appCount: sql<number>`cast(count(distinct ${applications.id}) as integer)`,
			paidInvoices: sql<number>`cast(count(distinct case when ${invoices.status} = 'PAID' then ${invoices.id} end) as integer)`
		})
		.from(tenants)
		.leftJoin(applications, eq(tenants.id, applications.tenantId))
		.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
		.where(where)
		.groupBy(tenants.id)
		.orderBy(
			sortOrder === 'desc'
				? desc((tenants as any)[sortBy])
				: (tenants as any)[sortBy] || desc(tenants.createdAt)
		)
		.limit(limit)
		.offset((page - 1) * limit);

	// 2. Get total count
	const [totalCount] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(tenants)
		.where(where);

	// 3. Get total active count
	const [activeCount] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(tenants)
		.where(eq(tenants.status, 'active'));

	const result = {
		data: data.map((t) => ({
			...t,
			stats: {
				applications: t.appCount,
				paidInvoices: t.paidInvoices
			}
		})),
		total: totalCount.count,
		activeCount: activeCount.count,
		page,
		totalPages: Math.ceil(totalCount.count / limit)
	};

	await setCached(cacheKey, result, 300); // 5 mins
	return result;
}

export async function getTenantById(id: string) {
	const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
	if (!tenant) return null;

	const [profile] = await db.select().from(schoolProfiles).where(eq(schoolProfiles.tenantId, id));

	return {
		...tenant,
		profile
	};
}

export async function updateTenantStatus(
	id: string,
	status: 'active' | 'inactive',
	actorId: string
) {
	const [updated] = await db
		.update(tenants)
		.set({
			status,
			updatedAt: new Date()
		})
		.where(eq(tenants.id, id))
		.returning();

	if (!updated) throw new Error('Tenant not found');

	// Log action
	await db.insert(auditLogs).values({
		actorId,
		action: 'update_tenant_status',
		target: `tenant:${id}`,
		details: JSON.stringify({ status })
	});

	clearCache('tenants:');
	return updated;
}

export async function getDashboardStats() {
	// 1. Total Tenants
	const allTenants = await db.query.tenants.findMany();
	const activeTenants = allTenants.filter((t) => t.status === 'active');

	// 2. Total Users (Parents)
	const [usersCount] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(users)
		.where(eq(users.role, 'parent'));

	// 3. New registrations today
	const [newUsersToday] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(users)
		.where(and(eq(users.role, 'parent'), sql`${users.createdAt} >= CURRENT_DATE`));

	// 4. Verification Queue (Total unverified across all schools)
	const [pendingVerifications] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(applications)
		.where(eq(applications.status, 'submitted'));

	// 5. Total Applications (Successful context)
	const [totalApplications] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(applications);

	// 6. Revenue & Transaction counts
	const [transactionsCount] = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	const [revenueResult] = await db
		.select({ total: sql<number>`cast(sum(${invoices.amount}) as integer)` })
		.from(invoices)
		.where(eq(invoices.status, 'PAID'));

	// 7. Daily Revenue (last 7 days)
	const dailyRevenue = await db
		.select({
			date: sql`DATE(${invoices.createdAt})`,
			amount: sql<number>`cast(sum(${invoices.amount}) as integer)`
		})
		.from(invoices)
		.where(
			and(eq(invoices.status, 'PAID'), sql`${invoices.createdAt} >= NOW() - INTERVAL '7 days'`)
		)
		.groupBy(sql`DATE(${invoices.createdAt})`)
		.orderBy(sql`DATE(${invoices.createdAt})`);

	// 8. Top performing schools by revenue
	const topSchools = await db
		.select({
			name: tenants.name,
			revenue: sql<number>`cast(sum(${invoices.amount}) as integer)`,
			appCount: sql<number>`cast(count(distinct ${applications.id}) as integer)`
		})
		.from(tenants)
		.leftJoin(invoices, and(eq(tenants.id, invoices.tenantId), eq(invoices.status, 'PAID')))
		.leftJoin(applications, eq(tenants.id, applications.tenantId))
		.groupBy(tenants.name)
		.orderBy(sql`sum(${invoices.amount}) DESC`)
		.limit(5);

	// 9. Live Snapshot: Recent payments across platform
	const recentPayments = await db
		.select({
			tenantName: tenants.name,
			amount: invoices.amount,
			paidAt: invoices.updatedAt
		})
		.from(invoices)
		.innerJoin(tenants, eq(invoices.tenantId, tenants.id))
		.where(eq(invoices.status, 'PAID'))
		.orderBy(desc(invoices.updatedAt))
		.limit(5);

	// 10. Unit-level Breakdown
	const appCountsSubquery = db
		.select({
			unitId: applications.unitId,
			count: sql<number>`cast(count(${applications.id}) as integer)`.as('app_count')
		})
		.from(applications)
		.groupBy(applications.unitId)
		.as('unit_app_counts');

	const revenueSubquery = db
		.select({
			unitId: invoices.unitId,
			total: sql<number>`cast(sum(${invoices.amount}) as integer)`.as('unit_revenue')
		})
		.from(invoices)
		.where(eq(invoices.status, 'PAID'))
		.groupBy(invoices.unitId)
		.as('unit_revenues');

	const unitStats = await db
		.select({
			unitId: units.id,
			unitName: units.name,
			tenantName: tenants.name,
			level: units.level,
			appCount: sql<number>`coalesce(${appCountsSubquery.count}, 0)`,
			revenue: sql<number>`coalesce(${revenueSubquery.total}, 0)`
		})
		.from(units)
		.innerJoin(tenants, eq(units.tenantId, tenants.id))
		.leftJoin(appCountsSubquery, eq(units.id, appCountsSubquery.unitId))
		.leftJoin(revenueSubquery, eq(units.id, revenueSubquery.unitId))
		.orderBy(tenants.name, units.name);

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
		unitStats,
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
			topSchools,
			recentPayments
		}
	};
}

export async function getEnhancedStats() {
	// Standard stats from the domain logic
	const baseStats = await getDashboardStats();

	// Additional insights for Super Admin
	return {
		...baseStats,
		performance: {
			dailyAverage: baseStats.financial.totalRevenue / 30, // Simplified
			activeRate: (baseStats.tenants.active / baseStats.tenants.total) * 100
		}
	};
}

/**
 * List all users with staff-level roles across the platform (Super Admin visibility)
 */
export async function listAdminUsers() {
	return await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
			status: users.status,
			tenantName: tenants.name,
			createdAt: users.createdAt
		})
		.from(users)
		.leftJoin(tenants, eq(users.tenantId, tenants.id))
		.where(or(eq(users.role, 'super_admin'), eq(users.role, 'school_admin'))) // Can be expanded
		.orderBy(desc(users.createdAt));
}
