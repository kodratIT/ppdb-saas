import type { PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { db } from '$lib/server/db';
import { tenants, invoices, applications, units, users } from '$lib/server/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const schoolId = params.schoolId;

	// Get school details
	const [school] = await db
		.select()
		.from(tenants)
		.where(eq(tenants.id, schoolId));

	if (!school) {
		throw new Error('School not found');
	}

	// Get unit stats for this school
	const unitStats = await db
		.select({
			unitId: units.id,
			unitName: units.name,
			level: units.level,
			appCount: sql<number>`cast(count(${applications.id}) as integer)`,
			revenue: sql<number>`cast(sum(${invoices.amount}) as integer)`,
			transactionCount: sql<number>`cast(count(${invoices.id}) as integer)`
		})
		.from(units)
		.leftJoin(applications, eq(units.id, applications.unitId))
		.leftJoin(invoices, and(eq(invoices.unitId, units.id), eq(invoices.status, 'PAID')))
		.where(eq(units.tenantId, schoolId))
		.groupBy(units.id, units.name, units.level)
		.orderBy(sql`sum(${invoices.amount}) DESC`);

	// Get daily revenue for this school
	const dailyRevenue = await db
		.select({
			date: sql`DATE(${invoices.createdAt})`,
			amount: sql<number>`cast(sum(${invoices.amount}) as integer)`
		})
		.from(invoices)
		.where(and(eq(invoices.tenantId, schoolId), eq(invoices.status, 'PAID')))
		.groupBy(sql`DATE(${invoices.createdAt})`)
		.orderBy(sql`DATE(${invoices.createdAt})`)
		.limit(30);

	// Calculate advanced metrics
	const totalRevenue = unitStats.reduce((sum, u) => sum + (u.revenue || 0), 0);
	const totalUsers = await db
		.select({ count: sql<number>`cast(count(*) as integer)` })
		.from(users)
		.where(eq(users.tenantId, schoolId));
	const userCount = totalUsers[0]?.count || 0;

	// MRR: Simplified - use last 30 days revenue
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const [mrrResult] = await db
		.select({ amount: sql<number>`cast(sum(${invoices.amount}) as integer)` })
		.from(invoices)
		.where(
			and(
				eq(invoices.tenantId, schoolId),
				eq(invoices.status, 'PAID'),
				sql`${invoices.createdAt} >= ${thirtyDaysAgo.toISOString()}`
			)
		);
	const mrr = mrrResult?.amount || 0;

	// ARPU: Average Revenue Per User
	const arpu = userCount > 0 ? totalRevenue / userCount : 0;

	// LTV: Average revenue per application
	const totalApps = unitStats.reduce((sum, u) => sum + (u.appCount || 0), 0);
	const ltv = totalApps > 0 ? totalRevenue / totalApps : 0;

	// Churn: Schools that stopped paying (simplified - inactive for 60+ days)
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
	const churnedSchools = school.status === 'inactive' ? 1 : 0;
	const churnRate = 1; // Will calculate across all schools

	// Anomaly detection: Check if revenue dropped > 20% compared to previous period
	const anomaly = dailyRevenue.length >= 2
		? (() => {
				const recent = dailyRevenue.slice(-7).reduce((sum, d) => sum + d.amount, 0);
				const previous = dailyRevenue.slice(-14, -7).reduce((sum, d) => sum + d.amount, 0);
				const drop = previous > 0 ? ((previous - recent) / previous) * 100 : 0;
				return {
					hasAnomaly: drop > 20,
					dropPercentage: drop.toFixed(1),
					message: drop > 20 ? `Revenue dropped ${drop.toFixed(1)}% compared to previous period` : null
				};
			})()
		: { hasAnomaly: false, dropPercentage: 0, message: null };

	return {
		school,
		unitStats,
		dailyRevenue,
		metrics: {
			totalRevenue,
			userCount,
			mrr,
			arpu,
			ltv,
			churnRate,
			anomaly
		}
	};
};
