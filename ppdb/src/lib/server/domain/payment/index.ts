import { db } from '$lib/server/db';
import {
	invoices,
	paymentTransactions,
	tenants,
	applications,
	feeStructures
} from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createInvoice, getInvoice, type InvoiceResponse } from '$lib/server/gateway/xendit';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import {
	sendInvoiceCreatedNotification,
	sendPaymentSuccessNotification,
	sendPaymentFailedNotification
} from './notifications';
export * from './verification';

/**
 * Generates an invoice for a specific application
 */
export async function generateInvoiceForApplication(
	tenantId: string,
	applicationId: string,
	feeStructureId: string
) {
	// 1. Get Global Xendit Key
	const secretKey = env.XENDIT_SECRET_KEY;

	if (!secretKey) {
		throw error(500, 'Payment gateway configuration missing (System Admin)');
	}

	// 2. Get Application & Fee Details
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, tenantId)),
		with: {
			user: true,
			tenant: true
		}
	});

	if (!application) throw error(404, 'Application not found');

	const tenant = application.tenant; // We need tenant details for redirect URLs

	const fee = await db.query.feeStructures.findFirst({
		where: and(eq(feeStructures.id, feeStructureId), eq(feeStructures.tenantId, tenantId))
	});

	if (!fee) throw error(404, 'Fee structure not found');

	// 3. Check for existing PENDING invoice
	const existingInvoice = await db.query.invoices.findFirst({
		where: and(eq(invoices.applicationId, applicationId), eq(invoices.status, 'PENDING')),
		orderBy: [desc(invoices.createdAt)]
	});

	if (existingInvoice) {
		// Verify if truly pending or expired at gateway
		try {
			const gatewayInvoice = await getInvoice(secretKey, existingInvoice.externalId);
			if (gatewayInvoice.status === 'PENDING') {
				// Resend notification for existing pending invoice? Maybe not to avoid spam.
				// But user requested invoice generation, so maybe they lost the link.
				// Let's send it again.
				await sendInvoiceCreatedNotification(
					existingInvoice,
					tenant,
					application,
					application.user
				);
				return existingInvoice;
			} else if (gatewayInvoice.status === 'EXPIRED') {
				// Mark as expired in DB
				await db
					.update(invoices)
					.set({ status: 'EXPIRED' })
					.where(eq(invoices.id, existingInvoice.id));
			} else if (gatewayInvoice.status === 'PAID') {
				// Auto-fix status
				await db
					.update(invoices)
					.set({ status: 'PAID' })
					.where(eq(invoices.id, existingInvoice.id));
				return existingInvoice; // Or throw error that it's already paid
			}
		} catch (e) {
			console.error('Failed to check existing invoice status', e);
			// Proceed to create new one if check fails? Or throw?
		}
	}

	// 4. Create New Invoice
	const externalId = `INV-${tenantId.slice(0, 8)}-${applicationId.slice(0, 8)}-${Date.now()}`;

	const gatewayResponse = await createInvoice(secretKey, {
		external_id: externalId,
		amount: fee.amount,
		payer_email: application.user.email,
		description: `Registration Fee: ${application.childFullName} (${fee.name})`,
		invoice_duration: 86400, // 24 hours
		success_redirect_url: `https://${tenant.slug}.ppdb.id/dashboard?payment=success`,
		failure_redirect_url: `https://${tenant.slug}.ppdb.id/dashboard?payment=failed`
	});

	// 5. Save to DB
	const [newInvoice] = await db
		.insert(invoices)
		.values({
			tenantId,
			applicationId,
			externalId: gatewayResponse.external_id,
			amount: gatewayResponse.amount,
			status: 'PENDING',
			invoiceUrl: gatewayResponse.invoice_url,
			expiryDate: new Date(gatewayResponse.expiry_date)
		})
		.returning();

	// 6. Send Notification
	await sendInvoiceCreatedNotification(newInvoice, tenant, application, application.user);

	return newInvoice;
}

/**
 * Handles Webhook from Xendit
 */
export async function handlePaymentWebhook(payload: any) {
	// Payload example: { id, external_id, status, amount, ... }
	const { external_id, status, id } = payload;

	if (!external_id) return;

	// Find Invoice with relations for notification
	const invoice = await db.query.invoices.findFirst({
		where: eq(invoices.externalId, external_id),
		with: {
			tenant: true,
			application: {
				with: {
					user: true
				}
			}
		}
	});

	if (!invoice) {
		console.warn(`Invoice not found for external_id: ${external_id}`);
		return;
	}

	// Update Invoice Status
	if (invoice.status !== status) {
		const newStatus = status === 'SETTLED' ? 'PAID' : status;

		await db
			.update(invoices)
			.set({
				status: newStatus, // Map SETTLED to PAID
				updatedAt: new Date()
			})
			.where(eq(invoices.id, invoice.id));

		// If Paid, Create Transaction Record & Update Application
		if (newStatus === 'PAID') {
			await db.insert(paymentTransactions).values({
				tenantId: invoice.tenantId,
				invoiceId: invoice.id,
				amount: payload.amount,
				paymentMethod: payload.payment_method || 'UNKNOWN',
				status: 'SUCCESS',
				paidAt: new Date(payload.paid_at || new Date()),
				externalId: id,
				rawResponse: JSON.stringify(payload)
			});

			await sendPaymentSuccessNotification(
				invoice,
				invoice.tenant,
				invoice.application,
				invoice.application.user
			);

			// Update Application Status (if needed, e.g. move to 'submitted' or 'verified' depending on flow)
			// For now, we assume payment is a requirement for submission or just a flag
			// Let's not auto-change application status here blindly without business rule check
			// But AC says: "Application status automatically updates to Paid" -> applicationStatusEnum doesn't have 'paid'
			// It has 'submitted', 'verified'. Maybe we don't change app status enum, but just invoice status.
			// Or maybe we map 'draft' -> 'submitted' if payment was the blocker.
		} else if (newStatus === 'EXPIRED' || newStatus === 'FAILED') {
			await sendPaymentFailedNotification(
				invoice,
				invoice.tenant,
				invoice.application,
				invoice.application.user
			);
		}
	}
}
