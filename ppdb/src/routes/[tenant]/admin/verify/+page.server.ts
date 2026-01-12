import { redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationDocuments, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);

	// Story 4.1: Only verifier or school_admin can access
	requireRole(auth, 'verifier', 'school_admin');

	// Fetch applications that need verification (submitted or under_review)
	const pendingApplications = await db
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
			// Count documents
			totalDocuments: sql<number>`(
				SELECT COUNT(*) 
				FROM ${applicationDocuments} 
				WHERE ${applicationDocuments.applicationId} = ${applications.id}
			)`,
			pendingDocuments: sql<number>`(
				SELECT COUNT(*) 
				FROM ${applicationDocuments} 
				WHERE ${applicationDocuments.applicationId} = ${applications.id}
				AND ${applicationDocuments.status} = 'pending'
			)`,
			verifiedDocuments: sql<number>`(
				SELECT COUNT(*) 
				FROM ${applicationDocuments} 
				WHERE ${applicationDocuments.applicationId} = ${applications.id}
				AND ${applicationDocuments.status} = 'verified'
			)`,
			rejectedDocuments: sql<number>`(
				SELECT COUNT(*) 
				FROM ${applicationDocuments} 
				WHERE ${applicationDocuments.applicationId} = ${applications.id}
				AND ${applicationDocuments.status} = 'rejected'
			)`
		})
		.from(applications)
		.leftJoin(admissionPaths, eq(applications.admissionPathId, admissionPaths.id))
		.where(
			and(
				eq(applications.tenantId, auth.tenantId),
				or(eq(applications.status, 'submitted'), eq(applications.status, 'under_review'))
			)
		)
		.orderBy(sql`${applications.submittedAt} DESC NULLS LAST`);

	// Stats summary
	const stats = {
		totalPending: pendingApplications.length,
		needsReview: pendingApplications.filter((app) => Number(app.pendingDocuments) > 0).length,
		fullyVerified: pendingApplications.filter(
			(app) =>
				Number(app.totalDocuments) > 0 &&
				Number(app.pendingDocuments) === 0 &&
				Number(app.rejectedDocuments) === 0
		).length,
		hasRejections: pendingApplications.filter((app) => Number(app.rejectedDocuments) > 0).length
	};

	return {
		applications: pendingApplications,
		stats,
		tenantSlug: params.tenant
	};
}
