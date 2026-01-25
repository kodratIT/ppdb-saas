import { db } from '$lib/server/db';
import { tenants, users } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getSystemMetrics } from '$lib/server/utils/system-metrics';
import { logSuccess } from '$lib/server/audit-logs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	// Log system overview access (non-blocking)
	try {
		const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		const userAgent = request.headers.get('user-agent') || 'unknown';

		await logSuccess(
			'READ',
			'SETTING',
			auth.userId,
			{
				userId: auth.userId,
				tenantId: auth.tenantId,
				details: {
					metadata: {
						page: 'system_overview',
						action: 'viewed_system_overview'
					}
				},
				ipAddress,
				userAgent
			}
		);
	} catch (error) {
		// Don't fail page load if logging fails
		console.error('Failed to log system overview access:', error);
	}

	// Get system metrics from shared utility
	const systemMetrics = await getSystemMetrics();

	// Platform stats (page-specific data)
	const [activeTenantsResult, totalUsersResult] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(tenants)
			.where(eq(tenants.status, 'active')),
		db.select({ count: sql<number>`count(*)` }).from(users)
	]);

	return {
		...systemMetrics,
		platform: {
			tenants: {
				active: Number(activeTenantsResult[0].count)
			},
			users: {
				total: Number(totalUsersResult[0].count)
			}
		}
	};
};
