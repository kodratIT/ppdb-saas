import { error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	applications,
	applicationDocuments,
	admissionPaths,
	documentReviews
} from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { getHomeVisitReport } from '$lib/server/domain/home-visit';

export async function load({
	locals,
	params
}: RequestEvent<{ tenant: string; applicationId: string }>) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'verifier', 'school_admin');

	const { applicationId } = params;

	// Fetch application with admission path
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId)),
		with: {
			admissionPath: true
		}
	});

	if (!application) {
		throw svelteError(404, 'Application not found');
	}

	// Fetch home visit report
	const homeVisitReport = await getHomeVisitReport(applicationId, auth.tenantId);

	// Fetch all documents for this application
	const documents = await db.query.applicationDocuments.findMany({
		where: and(
			eq(applicationDocuments.applicationId, applicationId),
			eq(applicationDocuments.tenantId, auth.tenantId)
		),
		orderBy: [applicationDocuments.uploadedAt]
	});

	// Fetch review history for each document
	const documentIds = documents.map((doc) => doc.id);
	const reviewHistory: Record<string, any[]> = {};

	for (const docId of documentIds) {
		const reviews = await db.query.documentReviews.findMany({
			where: and(
				eq(documentReviews.documentId, docId),
				eq(documentReviews.tenantId, auth.tenantId)
			),
			with: {
				reviewer: {
					columns: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: [desc(documentReviews.createdAt)]
		});
		reviewHistory[docId] = reviews;
	}

	return {
		application,
		documents,
		reviewHistory,
		homeVisitReport,
		tenantSlug: params.tenant,
		currentUserId: auth.userId
	};
}
