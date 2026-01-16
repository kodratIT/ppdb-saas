import { db } from '$lib/server/db';
import { invoices, paymentProofs, paymentTransactions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { sendPaymentSuccessNotification, sendPaymentFailedNotification } from './notifications';

/**
 * Submits a manual payment proof for an invoice.
 * Updates invoice status to VERIFYING.
 */
export async function submitPaymentProof(
	tenantId: string,
	invoiceId: string,
	fileUrl: string,
	notes?: string
) {
	// 1. Verify invoice exists and belongs to tenant
	const invoice = await db.query.invoices.findFirst({
		where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId))
	});

	if (!invoice) {
		throw error(404, 'Invoice not found');
	}

	if (invoice.status === 'PAID') {
		throw error(400, 'Invoice is already paid');
	}

	// 2. Insert proof
	const [proof] = await db
		.insert(paymentProofs)
		.values({
			tenantId,
			invoiceId,
			fileUrl,
			notes,
			status: 'PENDING'
		})
		.returning();

	// 3. Update invoice status
	await db
		.update(invoices)
		.set({
			status: 'VERIFYING',
			updatedAt: new Date()
		})
		.where(eq(invoices.id, invoiceId));

	return proof;
}

/**
 * Processes a manual payment verification (Accept/Reject).
 */
export async function processVerification(
	tenantId: string,
	proofId: string,
	action: 'accept' | 'reject',
	reviewerId: string,
	reason?: string
) {
	// 1. Fetch proof with invoice and related data for notifications
	const proof = await db.query.paymentProofs.findFirst({
		where: and(eq(paymentProofs.id, proofId), eq(paymentProofs.tenantId, tenantId)),
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
		throw error(404, 'Payment proof not found');
	}

	if (proof.status !== 'PENDING') {
		throw error(400, 'Proof is already processed');
	}

	const invoice = proof.invoice;

	if (action === 'accept') {
		// --- ACCEPT FLOW ---

		// 1. Update Proof
		const [updatedProof] = await db
			.update(paymentProofs)
			.set({
				status: 'ACCEPTED',
				reviewedBy: reviewerId,
				reviewedAt: new Date()
			})
			.where(eq(paymentProofs.id, proofId))
			.returning();

		// 2. Update Invoice
		await db
			.update(invoices)
			.set({
				status: 'PAID',
				updatedAt: new Date()
			})
			.where(eq(invoices.id, invoice.id));

		// 3. Create Transaction Record
		await db.insert(paymentTransactions).values({
			tenantId,
			invoiceId: invoice.id,
			amount: invoice.amount,
			paymentMethod: 'MANUAL_TRANSFER',
			status: 'SUCCESS',
			paidAt: new Date(),
			externalId: `MANUAL-${proofId}`, // internal reference
			rawResponse: JSON.stringify({ proofId, reviewerId })
		});

		// 4. Send Success Notification
		await sendPaymentSuccessNotification(
			{ ...invoice, status: 'PAID' }, // Pass updated state
			invoice.tenant,
			invoice.application,
			invoice.application.user
		);

		return updatedProof;
	} else {
		// --- REJECT FLOW ---

		// 1. Update Proof
		const [updatedProof] = await db
			.update(paymentProofs)
			.set({
				status: 'REJECTED',
				reviewedBy: reviewerId,
				reviewedAt: new Date(),
				rejectionReason: reason
			})
			.where(eq(paymentProofs.id, proofId))
			.returning();

		// 2. Update Invoice
		await db
			.update(invoices)
			.set({
				status: 'REJECTED', // Or FAILED/PENDING based on desired retry flow. Let's use REJECTED to match spec intent.
				updatedAt: new Date()
			})
			.where(eq(invoices.id, invoice.id));

		// 3. Send Failed Notification
		await sendPaymentFailedNotification(
			{ ...invoice, status: 'REJECTED' },
			invoice.tenant,
			invoice.application,
			invoice.application.user
		);

		return updatedProof;
	}
}
