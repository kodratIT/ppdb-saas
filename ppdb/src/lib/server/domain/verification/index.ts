/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import {
	applications,
	applicationDocuments,
	documentReviews,
	auditLogs
} from '$lib/server/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

/**
 * Get list of applications that require verification.
 * Filters for 'submitted' or 'under_review' status.
 */
export async function getVerificationQueue(tenantId: string) {
	return await db.query.applications.findMany({
		where: and(
			eq(applications.tenantId, tenantId),
			inArray(applications.status, ['submitted', 'under_review'])
		),
		with: {
			user: true,
			admissionPath: true,
			documents: true
		},
		orderBy: [desc(applications.submittedAt)]
	});
}

/**
 * Get detailed application data for verification view.
 */
export async function getApplicationForVerification(applicationId: string) {
	return await db.query.applications.findFirst({
		where: eq(applications.id, applicationId),
		with: {
			user: true,
			admissionPath: true,
			documents: {
				with: {
					verifier: true
				}
			}
		}
	});
}

/**
 * Process a document verification action.
 * Updates document status, logs the review, and updates application status if applicable.
 */
export async function verifyDocument(
	tenantId: string,
	documentId: string,
	reviewerId: string,
	action: 'approve' | 'reject' | 'request_revision',
	reason?: string
) {
	return await db.transaction(async (tx) => {
		// 1. Get current document status
		const doc = await tx.query.applicationDocuments.findFirst({
			where: eq(applicationDocuments.id, documentId)
		});

		if (!doc) throw new Error('Document not found');

		// 2. Determine new status
		let newStatus: 'verified' | 'rejected' | 'revision_requested' = 'verified';
		if (action === 'reject') newStatus = 'rejected';
		if (action === 'request_revision') newStatus = 'revision_requested';

		// 3. Update document
		await tx
			.update(applicationDocuments)
			.set({
				status: newStatus,
				verifiedBy: reviewerId,
				verifiedAt: new Date(),
				rejectionReason: reason || null
			})
			.where(eq(applicationDocuments.id, documentId));

		// 4. Create review log
		await tx.insert(documentReviews).values({
			tenantId,
			documentId,
			reviewerId,
			action: action,
			previousStatus: doc.status,
			newStatus: newStatus,
			reason: reason || null
		});

		// 5. Check overall application status
		// Fetch all docs for this app to see if we can move the application state
		const allDocs = await tx.query.applicationDocuments.findMany({
			where: eq(applicationDocuments.applicationId, doc.applicationId)
		});

		// Check conditions
		const allVerified = allDocs.every((d) =>
			d.id === documentId ? newStatus === 'verified' : d.status === 'verified'
		);

		// If all documents are verified, promote application to 'verified'
		// Otherwise, ensure it is 'under_review' (unless it was already something else, but here we assume flow is linear)

		let newAppStatus = 'under_review';
		if (allVerified) {
			newAppStatus = 'verified';
		}

		// Update application status
		// First get old status to check for change
		const currentApp = await tx.query.applications.findFirst({
			where: eq(applications.id, doc.applicationId),
			columns: { status: true }
		});

		if (currentApp && currentApp.status !== newAppStatus) {
			await tx
				.update(applications)
				.set({ status: newAppStatus as any })
				.where(eq(applications.id, doc.applicationId));

			// Log status change
			await tx.insert(auditLogs).values({
				actorId: reviewerId,
				action: 'update_application_status',
				target: `application:${doc.applicationId}`,
				details: JSON.stringify({
					old_status: currentApp.status,
					new_status: newAppStatus,
					reason: `Document ${documentId} verification outcome`
				})
			});
		}

		return { success: true, newStatus, newAppStatus };
	});
}
