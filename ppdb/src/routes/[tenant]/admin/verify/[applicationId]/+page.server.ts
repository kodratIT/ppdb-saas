import { error as svelteError, fail, type RequestEvent, redirect } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	applications,
	applicationDocuments,
	documentReviews,
	invoices,
	paymentTransactions,
	paymentProofs,
	applicationScores,
	selectionResultDetails,
	homeVisitReports
} from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { getHomeVisitReport } from '$lib/server/domain/home-visit';
import { WaitlistService } from '$lib/server/domain/ranking/waitlist';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';
import { processCustomFieldsForDisplay } from '$lib/server/utils/custom-fields';

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

	// Decrypt custom fields if present
	let processedApplication = application;
	if (application.customFieldValues) {
		const values = JSON.parse(application.customFieldValues);
		const decryptedValues = await processCustomFieldsForDisplay(
			auth.tenantId,
			application.admissionPathId,
			values
		);
		// @ts-expect-error - processedApplication includes decrypted custom fields which might not match exact schema types
		processedApplication = { ...application, customFieldValues: JSON.stringify(decryptedValues) };
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		application: processedApplication,
		documents,
		reviewHistory,
		homeVisitReport,
		tenantSlug: params.tenant,
		currentUserId: auth.userId,
		isSuperAdmin: auth.session.role === 'super_admin'
	};
}

export const actions = {
	withdraw: async ({ params, locals }: RequestEvent) => {
		const auth = await requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin'); // Only admins can withdraw

		const { applicationId } = params;

		const application = await db.query.applications.findFirst({
			where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId))
		});

		if (!application) return fail(404, { message: 'Application not found' });

		if (application.status !== 'accepted') {
			return fail(400, { message: 'Only accepted applications can be withdrawn' });
		}

		// Update Status to Withdrawn
		await db
			.update(applications)
			.set({
				status: 'withdrawn',
				updatedAt: new Date()
			})
			.where(eq(applications.id, applicationId));

		await logSensitiveAction(auth.userId, 'withdraw_student', applicationId, {
			reason: 'Manual withdrawal by admin'
		});

		// Trigger Waitlist Service
		// Fire and forget or await? Better await to ensure consistency for now.
		await WaitlistService.processVacancy(auth.tenantId, application.admissionPathId);

		return { success: true };
	},

	delete_permanent: async ({ params, locals }: RequestEvent) => {
		const auth = await requireAuth(locals);
		requireRole(auth, 'super_admin'); // Only super_admin can delete permanently

		const { applicationId } = params;

		// Verify existence
		const application = await db.query.applications.findFirst({
			where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId))
		});

		if (!application) return fail(404, { message: 'Application not found' });

		// Perform Cascade Deletion Manually (if not set in DB) or Rely on DB
		// Since we want to be safe and explicit, let's delete related records in order.
		// Note: Many relations have ON DELETE CASCADE in schema, but some might not.
		// Safe order: Child -> Parent

		await db.transaction(async (tx) => {
			// 1. Delete Selection Results Details
			await tx
				.delete(selectionResultDetails)
				.where(eq(selectionResultDetails.applicationId, applicationId));

			// 2. Delete Application Scores
			await tx.delete(applicationScores).where(eq(applicationScores.applicationId, applicationId));

			// 3. Delete Home Visit Reports (and Photos via Cascade if configured, otherwise manually)
			// Assuming Cascade on Photos -> Report
			await tx.delete(homeVisitReports).where(eq(homeVisitReports.applicationId, applicationId));

			// 4. Delete Payment Proofs
			// Need to find invoices first
			const appInvoices = await tx.query.invoices.findMany({
				where: eq(invoices.applicationId, applicationId),
				columns: { id: true }
			});
			for (const inv of appInvoices) {
				await tx.delete(paymentProofs).where(eq(paymentProofs.invoiceId, inv.id));
				await tx.delete(paymentTransactions).where(eq(paymentTransactions.invoiceId, inv.id));
			}

			// 5. Delete Invoices
			await tx.delete(invoices).where(eq(invoices.applicationId, applicationId));

			// 6. Delete Document Reviews (Cascade from Documents)
			// 7. Delete Application Documents (Cascade from Application)
			// But let's be explicit if needed. Schema says:
			// applicationId: uuid('application_id').references(() => applications.id, { onDelete: 'cascade' })
			// So deleting application should clear documents and reviews.

			// 8. Delete Application
			await tx.delete(applications).where(eq(applications.id, applicationId));
		});

		await logSensitiveAction(auth.userId, 'delete_permanent_application', applicationId, {
			studentName: application.childFullName,
			reason: 'Right to Erasure / GDPR Request'
		});

		throw redirect(302, `/${auth.tenantId}/admin/verify`);
	}
};
