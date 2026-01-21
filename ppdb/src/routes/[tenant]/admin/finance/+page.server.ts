import { db } from '$lib/server/db';
import { invoices, paymentTransactions, paymentProofs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, desc } from 'drizzle-orm';
import { fail, type Actions } from '@sveltejs/kit';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';
import type { PageServerLoad } from './$types';
import { sendPaymentSuccessNotification } from '$lib/server/domain/payment/notifications';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'treasurer');

	const invoicesList = await db.query.invoices.findMany({
		where: eq(invoices.tenantId, auth.tenantId),
		with: {
			application: {
				with: {
					user: true // Parent details
				}
			},
			transactions: true,
			proofs: {
				orderBy: [desc(paymentProofs.uploadedAt)],
				limit: 1
			}
		},
		orderBy: [desc(invoices.createdAt)]
	});

	// Calculate stats
	const stats = {
		totalRevenue: invoicesList
			.filter((i) => i.status === 'PAID')
			.reduce((acc, curr) => acc + curr.amount, 0),
		pendingCount: invoicesList.filter((i) => i.status === 'PENDING').length,
		verifyingCount: invoicesList.filter((i) => i.status === 'VERIFYING').length,
		paidCount: invoicesList.filter((i) => i.status === 'PAID').length,
		failedCount: invoicesList.filter((i) => i.status === 'FAILED' || i.status === 'EXPIRED').length
	};

	return {
		invoices: invoicesList.map((inv) => ({
			id: inv.id,
			externalId: inv.externalId,
			amount: inv.amount,
			status: inv.status,
			createdAt: inv.createdAt,
			expiryDate: inv.expiryDate,
			studentName: inv.application.childFullName,
			parentName: inv.application.parentFullName || inv.application.user.name,
			parentEmail: inv.application.user.email,
			transactions: inv.transactions,
			latestProof: inv.proofs[0] || null
		})),
		stats
	};
};

export const actions: Actions = {
	verify: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'treasurer');

		const formData = await request.formData();
		const proofId = formData.get('proofId') as string;
		const action = formData.get('action') as string; // 'approve' | 'reject'
		const reason = formData.get('reason') as string;

		if (!proofId || !action) {
			return fail(400, { message: 'Missing parameters' });
		}

		const proof = await db.query.paymentProofs.findFirst({
			where: eq(paymentProofs.id, proofId),
			with: {
				invoice: {
					with: {
						tenant: true,
						application: {
							with: {
								user: true
							}
						}
					}
				}
			}
		});

		if (!proof) {
			return fail(404, { message: 'Proof not found' });
		}

		if (action === 'approve') {
			await db.transaction(async (tx) => {
				// 1. Update Proof
				await tx
					.update(paymentProofs)
					.set({
						status: 'ACCEPTED',
						reviewedBy: auth.userId,
						reviewedAt: new Date()
					})
					.where(eq(paymentProofs.id, proofId));

				// 2. Update Invoice
				await tx
					.update(invoices)
					.set({
						status: 'PAID',
						updatedAt: new Date()
					})
					.where(eq(invoices.id, proof.invoiceId));

				// 3. Create Transaction
				await tx.insert(paymentTransactions).values({
					invoiceId: proof.invoiceId,
					tenantId: proof.invoice.tenantId,
					amount: proof.invoice.amount,
					paymentMethod: 'MANUAL_TRANSFER',
					status: 'SUCCESS',
					paidAt: new Date(),
					externalId: proofId
				});
			});

			await logSensitiveAction(auth.userId, 'approve_manual_payment', proof.invoiceId, {
				proofId,
				amount: proof.invoice.amount
			});

			// Send Notification
			await sendPaymentSuccessNotification(
				proof.invoice,
				proof.invoice.tenant,
				proof.invoice.application,
				proof.invoice.application.user
			);
		} else if (action === 'reject') {
			await db.transaction(async (tx) => {
				// 1. Update Proof
				await tx
					.update(paymentProofs)
					.set({
						status: 'REJECTED',
						rejectionReason: reason || 'Bukti tidak valid',
						reviewedBy: auth.userId,
						reviewedAt: new Date()
					})
					.where(eq(paymentProofs.id, proofId));

				// 2. Update Invoice back to PENDING (so they can try again)
				await tx
					.update(invoices)
					.set({
						status: 'PENDING', // Allow retry
						updatedAt: new Date()
					})
					.where(eq(invoices.id, proof.invoiceId));
			});

			await logSensitiveAction(auth.userId, 'reject_manual_payment', proof.invoiceId, {
				proofId,
				reason
			});
		}

		return { success: true };
	}
};
