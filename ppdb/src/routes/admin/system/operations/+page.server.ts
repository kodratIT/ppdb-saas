import { db } from '$lib/server/db';
import { tenants, users, applications, invoices } from '$lib/server/db/schema';
import { sql, eq, gte, and } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getSystemMetrics } from '$lib/server/utils/system-metrics';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const now = new Date();
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	// Get system metrics from shared utility (with memory usage for operations page)
	const systemMetrics = await getSystemMetrics(true);

	// Platform stats (page-specific data)
	const [totalTenantsResult, activeTenantsResult, totalUsersResult] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(tenants),
		db.select({ count: sql<number>`count(*)` }).from(tenants).where(eq(tenants.status, 'active')),
		db.select({ count: sql<number>`count(*)` }).from(users)
	]);

	const [newUsersTodayResult, newAppsTodayResult, transactionsTodayResult] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, oneDayAgo)),
		db.select({ count: sql<number>`count(*)` }).from(applications).where(gte(applications.createdAt, oneDayAgo)),
		db.select({ count: sql<number>`count(*)` }).from(invoices).where(
			and(eq(invoices.status, 'PAID'), gte(invoices.updatedAt, oneDayAgo))
		)
	]);

	return {
		...systemMetrics,
		platform: {
			tenants: { total: Number(totalTenantsResult[0].count), active: Number(activeTenantsResult[0].count) },
			users: { total: Number(totalUsersResult[0].count), newToday: Number(newUsersTodayResult[0].count) },
			applications: { newToday: Number(newAppsTodayResult[0].count) },
			transactions: { today: Number(transactionsTodayResult[0].count) }
		}
	};
};
