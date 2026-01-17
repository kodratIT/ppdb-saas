import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, customFields, fieldOptions, users } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { sendOTP, verifyOTP } from '$lib/server/whatsapp/providers/waha';
import { processCustomFieldsForDisplay } from '$lib/server/utils/custom-fields';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const existingDraft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'draft')
		)
	});

	if (!existingDraft) {
		throw redirect(303, `/${params.tenant}/register/form/step-1`);
	}

	// Fetch all custom fields for this admission path for the summary
	const allFields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, auth.tenantId),
			eq(customFields.admissionPathId, existingDraft.admissionPathId)
		),
		with: {
			options: {
				orderBy: [asc(fieldOptions.order)]
			}
		},
		orderBy: [asc(customFields.order)]
	});

	// Decrypt sensitive draft data
	if (existingDraft?.customFieldValues) {
		const values = JSON.parse(existingDraft.customFieldValues);
		const decryptedValues = await processCustomFieldsForDisplay(
			auth.tenantId,
			existingDraft.admissionPathId,
			values
		);
		// @ts-expect-error - existingDraft structure is modified to include JSON stringified customFieldValues
		existingDraft.customFieldValues = JSON.stringify(decryptedValues);
	}

	return {
		draft: existingDraft,
		customFields: allFields,
		tenantSlug: params.tenant
	};
}

export const actions = {
	sendOTP: async ({ request, locals }: RequestEvent<{ tenant: string }>) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const formData = await request.formData();
		const phoneNumber = formData.get('phoneNumber')?.toString();

		if (!phoneNumber) {
			return fail(400, { error: 'Nomor WhatsApp harus diisi' });
		}

		try {
			const result = await sendOTP(phoneNumber);
			return { success: true, sessionId: result.sessionId, phoneNumber };
		} catch (error: unknown) {
			console.error('Failed to send OTP:', error);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return fail(500, { error: (error as any).message || 'Gagal mengirim kode OTP' });
		}
	},

	submitApplication: async ({ request, locals }: RequestEvent<{ tenant: string }>) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const formData = await request.formData();
		const sessionId = formData.get('sessionId')?.toString();
		const otpCode = formData.get('otpCode')?.toString();
		const phoneNumber = formData.get('phoneNumber')?.toString();

		if (!sessionId || !otpCode || !phoneNumber) {
			return fail(400, { error: 'Session ID, kode OTP, dan nomor telepon harus diisi' });
		}

		try {
			// Verify OTP
			const verification = await verifyOTP(sessionId, otpCode);

			if (!verification.valid) {
				return fail(400, { error: 'Kode OTP tidak valid atau sudah kadaluarsa' });
			}

			// Get existing draft
			const existingDraft = await db.query.applications.findFirst({
				where: and(
					eq(applications.userId, auth.userId),
					eq(applications.tenantId, auth.tenantId),
					eq(applications.status, 'draft')
				)
			});

			if (!existingDraft) {
				return fail(404, { error: 'Draft pendaftaran tidak ditemukan' });
			}

			// Check if account with this phone already exists
			let user = await db.query.users.findFirst({
				where: and(
					eq(users.email, phoneNumber), // We use email field to store phone
					eq(users.tenantId, auth.tenantId)
				)
			});

			// If no persistent account exists, create one
			if (!user) {
				const [newUser] = await db
					.insert(users)
					.values({
						email: phoneNumber,
						name: existingDraft.parentFullName || 'Orang Tua',
						tenantId: auth.tenantId,
						role: 'parent',
						status: 'active'
					})
					.returning();
				user = newUser;
			}

			// Update application with final submission
			await db
				.update(applications)
				.set({
					userId: user.id, // Link to persistent account
					status: 'submitted',
					submittedAt: new Date(),
					currentStep: 5,
					completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
					updatedAt: new Date()
				})
				.where(eq(applications.id, existingDraft.id));

			// Create persistent session
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
			await db.insert(sessions).values({
				userId: user.id,
				tenantId: auth.tenantId,
				authType: 'waha',
				authIdentifier: phoneNumber,
				expiresAt
			});

			throw redirect(303, `/${params.tenant}/register/success?applicationId=${existingDraft.id}`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to submit application:', error);
			return fail(500, { error: 'Gagal mengirim pendaftaran. Silakan coba lagi.' });
		}
	}
};
