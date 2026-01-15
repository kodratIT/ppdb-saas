import { db } from '$lib/server/db';
import { applications, admissionPaths, invoices } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, and, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin', 'verifier', 'treasurer');

	// Parallel queries for stats
	const [applicantsCount, verifiedCount, activePaths, totalRevenue] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(applications)
			.where(eq(applications.tenantId, auth.tenantId)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(applications)
			.where(and(eq(applications.tenantId, auth.tenantId), eq(applications.status, 'verified'))),
		db
			.select({ count: sql<number>`count(*)` })
			.from(admissionPaths)
			.where(and(eq(admissionPaths.tenantId, auth.tenantId), eq(admissionPaths.status, 'open'))),
		db
			.select({ total: sql<number>`sum(${invoices.amount})` })
			.from(invoices)
			.where(and(eq(invoices.tenantId, auth.tenantId), eq(invoices.status, 'PAID')))
	]);

	return {
		stats: {
			applicants: Number(applicantsCount[0]?.count || 0),
			verified: Number(verifiedCount[0]?.count || 0),
			activePaths: Number(activePaths[0]?.count || 0),
			revenue: Number(totalRevenue[0]?.total || 0)
		}
	};
};
