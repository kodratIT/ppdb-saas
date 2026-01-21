import { db } from '$lib/server/db';
import { tenants, users, applications, invoices } from '$lib/server/db/schema';
import { sql, eq, gte, and } from 'drizzle-orm';
import { checkWahaHealth } from '$lib/server/integrations/waha';
import { checkXenditHealth } from '$lib/server/integrations/xendit';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const now = new Date();
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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
	let dbHealth: { status: 'healthy' | 'degraded' | 'error' | 'unknown'; latency: number; error: null | string } = {
		status: 'unknown',
		latency: 0,
		error: null
	};
	try {
		const start = Date.now();
		await db.execute(sql`SELECT 1`);
		dbHealth = { status: 'healthy', latency: Date.now() - start, error: null };
	} catch (e) {
		dbHealth = { status: 'error', latency: 0, error: e instanceof Error ? e.message : 'Unknown' };
	}

	// External integrations
	const [wahaHealth, xenditHealth] = await Promise.all([checkWahaHealth(), checkXenditHealth()]);

	// Platform stats
	const [totalTenantsResult, activeTenantsResult, totalUsersResult] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(tenants),
		db
			.select({ count: sql<number>`count(*)` })
			.from(tenants)
			.where(eq(tenants.status, 'active')),
		db.select({ count: sql<number>`count(*)` }).from(users)
	]);

	const [newUsersTodayResult, newAppsTodayResult, transactionsTodayResult] = await Promise.all([
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
			tenants: {
				total: Number(totalTenantsResult[0].count),
				active: Number(activeTenantsResult[0].count)
			},
			users: {
				total: Number(totalUsersResult[0].count),
				newToday: Number(newUsersTodayResult[0].count)
			},
			applications: { newToday: Number(newAppsTodayResult[0].count) },
			transactions: { today: Number(transactionsTodayResult[0].count) }
		},
		status,
		timestamp: now.toISOString()
	};
};
