import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	applicationDocuments,
	documentReviews,
	auditLogs,
	applications
} from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'verifier', 'school_admin');

	const documentId = (params as { documentId: string }).documentId;
	const body = await request.json();
	const { action, reason } = body;

	// Validate action
	const validActions = ['approve', 'reject', 'request_revision'];
	if (!validActions.includes(action)) {
		throw svelteError(400, `Invalid action: ${action}`);
	}

	// Validate reason for reject/request_revision
	if ((action === 'reject' || action === 'request_revision') && !reason?.trim()) {
		throw svelteError(400, 'Reason is required for reject/request_revision actions');
	}

	// Fetch document
	const document = await db.query.applicationDocuments.findFirst({
		where: and(
			eq(applicationDocuments.id, documentId),
			eq(applicationDocuments.tenantId, auth.tenantId)
		)
	});

	if (!document) {
		throw svelteError(404, 'Document not found');
	}

	// Determine new status
	const previousStatus = document.status;
	let newStatus: 'verified' | 'rejected' | 'pending';

	if (action === 'approve') {
		newStatus = 'verified';
	} else if (action === 'reject') {
		newStatus = 'rejected';
	} else {
		// request_revision
		newStatus = 'pending';
	}

	// Start transaction
	try {
		// 1. Update document status
		await db
			.update(applicationDocuments)
			.set({
				status: newStatus,
				verifiedBy: auth.userId,
				verifiedAt: new Date(),
				rejectionReason: action === 'reject' || action === 'request_revision' ? reason : null,
				updatedAt: new Date()
			})
			.where(eq(applicationDocuments.id, documentId));

		// 2. Create document review record
		await db.insert(documentReviews).values({
			documentId,
			tenantId: auth.tenantId,
			reviewerId: auth.userId,
			action: action as 'approve' | 'reject' | 'request_revision',
			reason: reason || null,
			previousStatus,
			newStatus
		});

		// 3. Create audit log entry (NFR12 - immutable audit trail)
		await db.insert(auditLogs).values({
			actorId: auth.userId,
			action: action === 'approve' ? 'approve' : 'reject',
			target: `document:${documentId}`,
			details: JSON.stringify({
				tenantId: auth.tenantId,
				documentId,
				action,
				previousStatus,
				newStatus,
				reason: reason || null,
				applicationId: document.applicationId
			})
		});

		// 4. Update application status if all documents verified
		const allDocuments = await db.query.applicationDocuments.findMany({
			where: and(
				eq(applicationDocuments.applicationId, document.applicationId),
				eq(applicationDocuments.tenantId, auth.tenantId)
			)
		});

		const allVerified = allDocuments.every((doc) => doc.status === 'verified');
		const hasRejected = allDocuments.some((doc) => doc.status === 'rejected');

		if (allVerified && allDocuments.length > 0) {
			// All documents verified → mark application as verified
			await db
				.update(applications)
				.set({
					status: 'verified',
					updatedAt: new Date()
				})
				.where(eq(applications.id, document.applicationId));
		} else if (hasRejected) {
			// Has rejected documents → mark as under_review
			await db
				.update(applications)
				.set({
					status: 'under_review',
					updatedAt: new Date()
				})
				.where(eq(applications.id, document.applicationId));
		}

		// Fetch updated document
		const updatedDocument = await db.query.applicationDocuments.findFirst({
			where: eq(applicationDocuments.id, documentId)
		});

		return json({
			success: true,
			message: `Document ${action}d successfully`,
			document: updatedDocument
		});
	} catch (error) {
		console.error('Document verification error:', error);
		throw svelteError(500, 'Failed to verify document');
	}
}
