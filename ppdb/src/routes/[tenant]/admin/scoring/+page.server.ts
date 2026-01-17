import { type RequestEvent } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	// Fetch verified applications with score status
	const verifiedApps = await db
		.select({
			id: applications.id,
			childFullName: applications.childFullName,
			parentFullName: applications.parentFullName,
			parentPhone: applications.parentPhone,
			status: applications.status,
			submittedAt: applications.submittedAt,
			createdAt: applications.createdAt,
			admissionPathId: applications.admissionPathId,
			admissionPathName: admissionPaths.name,
			// Join score data
			scoreId: applicationScores.id,
			score: applicationScores.score,
			isFinalized: applicationScores.isFinalized,
			scoredAt: applicationScores.createdAt
		})
		.from(applications)
		.leftJoin(admissionPaths, eq(applications.admissionPathId, admissionPaths.id))
		.leftJoin(
			applicationScores,
			and(
				eq(applicationScores.applicationId, applications.id),
				eq(applicationScores.tenantId, auth.tenantId)
			)
		)
		.where(
			and(
				eq(applications.tenantId, auth.tenantId),
				eq(applications.status, 'verified') // Only verified candidates
			)
		)
		.orderBy(sql`${applications.submittedAt} DESC NULLS LAST`);

	// Stats
	const stats = {
		totalVerified: verifiedApps.length,
		notScored: verifiedApps.filter((app) => !app.scoreId).length,
		scoredDraft: verifiedApps.filter((app) => app.scoreId && !app.isFinalized).length,
		scoredFinalized: verifiedApps.filter((app) => app.isFinalized).length
	};

	return {
		applications: verifiedApps,
		stats,
		tenantSlug: params.tenant
	};
}
