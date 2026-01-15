import { db } from '$lib/server/db';
import { applications, feeStructures, invoices, paymentProofs, schoolProfiles } from '$lib/server/db/schema';
import { requireAuth } from '$lib/server/auth/authorization';
import { and, eq, desc } from 'drizzle-orm';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { generateInvoiceForApplication } from '$lib/server/domain/payment';
import { R2Storage } from '$lib/server/storage/r2';

export async function load({ locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);

	// Get user's application
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.userId, auth.userId), eq(applications.tenantId, auth.tenantId)),
		with: {
			admissionPath: true,
			invoices: {
				orderBy: [desc(invoices.createdAt)],
				limit: 1
			}
		}
	});

	if (!application) {
		throw redirect(302, `/${auth.tenantId}/register`);
	}

	// Get Fee Structure
	const fee = await db.query.feeStructures.findFirst({
		where: and(
			eq(feeStructures.admissionPathId, application.admissionPathId),
			eq(feeStructures.tenantId, auth.tenantId),
			eq(feeStructures.paymentTiming, 'registration'), // MVP: Registration fee only
			eq(feeStructures.status, 'active')
		)
	});

	// Get School Profile for Bank Info
	const schoolProfile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, auth.tenantId)
	});

	return {
		application,
		fee,
		latestInvoice: application.invoices[0] || null,
		bankInfo: {
			bankName: schoolProfile?.bankName,
			bankAccountName: schoolProfile?.bankAccountName,
			bankAccountNumber: schoolProfile?.bankAccountNumber
		}
	};
}

export const actions = {
	pay: async ({ locals, params }: RequestEvent) => {
		const auth = await requireAuth(locals);

		// Get user's application
		const application = await db.query.applications.findFirst({
			where: and(eq(applications.userId, auth.userId), eq(applications.tenantId, auth.tenantId))
		});

		if (!application) return fail(404, { message: 'Application not found' });

		// Get Fee
		const fee = await db.query.feeStructures.findFirst({
			where: and(
				eq(feeStructures.admissionPathId, application.admissionPathId),
				eq(feeStructures.tenantId, auth.tenantId),
				eq(feeStructures.paymentTiming, 'registration'),
				eq(feeStructures.status, 'active')
			)
		});

		if (!fee) return fail(400, { message: 'No registration fee required for this path' });

		try {
			const invoice = await generateInvoiceForApplication(
				auth.tenantId,
				application.id,
				fee.id
			);

			// Redirect to Xendit Invoice
			throw redirect(303, invoice.invoiceUrl);
		} catch (err) {
			if ((err as any).status === 303) throw err; // Re-throw redirect
			console.error('Payment generation error:', err);
			return fail(500, { message: 'Gagal membuat invoice pembayaran' });
		}
	},

	uploadProof: async ({ request, locals, platform }: RequestEvent) => {
		const auth = await requireAuth(locals);
		const formData = await request.formData();
		const proofFile = formData.get('proof') as File;
		const notes = formData.get('notes') as string;

		if (!proofFile || proofFile.size === 0) {
			return fail(400, { message: 'Bukti transfer wajib diupload' });
		}

		// 1. Get Application & Fee
		const application = await db.query.applications.findFirst({
			where: and(eq(applications.userId, auth.userId), eq(applications.tenantId, auth.tenantId))
		});

		if (!application) return fail(404, { message: 'Application not found' });

		const fee = await db.query.feeStructures.findFirst({
			where: and(
				eq(feeStructures.admissionPathId, application.admissionPathId),
				eq(feeStructures.tenantId, auth.tenantId),
				eq(feeStructures.paymentTiming, 'registration'),
				eq(feeStructures.status, 'active')
			)
		});

		if (!fee) return fail(400, { message: 'Biaya tidak ditemukan' });

		// 2. Create Invoice (Manual Type) if not exists
		// Note: We create an invoice with VERIFYING status
		let invoice = await db.query.invoices.findFirst({
			where: and(
				eq(invoices.applicationId, application.id),
				eq(invoices.status, 'PENDING')
			)
		});

		if (!invoice) {
			const externalId = `MANUAL-${auth.tenantId.slice(0, 8)}-${Date.now()}`;
			const [newInvoice] = await db
				.insert(invoices)
				.values({
					tenantId: auth.tenantId,
					applicationId: application.id,
					externalId: externalId,
					amount: fee.amount,
					status: 'VERIFYING',
					invoiceUrl: '#', // No Xendit URL for manual
					expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
				})
				.returning();
			invoice = newInvoice;
		} else {
			// Update existing pending invoice to verifying
			await db
				.update(invoices)
				.set({ status: 'VERIFYING', updatedAt: new Date() })
				.where(eq(invoices.id, invoice.id));
		}

		// 3. Save Proof
		let imageUrl: string;

		// @ts-ignore - Platform might be undefined in dev
		if (platform?.env?.DOCUMENTS_BUCKET) {
			const storage = new R2Storage(platform.env.DOCUMENTS_BUCKET);
			const safeFilename = proofFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
			const key = `tenants/${auth.tenantId}/payments/${invoice.id}/${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;
			await storage.upload(key, new Uint8Array(await proofFile.arrayBuffer()), {
				httpMetadata: { contentType: proofFile.type }
			});
			imageUrl = `r2:${key}`;
		} else {
			// Fallback (Mock storage for now - encrypting base64)
			const arrayBuffer = await proofFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64 = buffer.toString('base64');
			imageUrl = `data:${proofFile.type};base64,${base64}`;
		}

		await db.insert(paymentProofs).values({
			tenantId: auth.tenantId,
			invoiceId: invoice.id,
			imageUrl: imageUrl,
			notes: notes,
			status: 'PENDING'
		});

		return { success: true, message: 'Bukti transfer berhasil dikirim' };
	}
};
