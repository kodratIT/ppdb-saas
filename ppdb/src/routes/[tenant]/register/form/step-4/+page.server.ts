import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, customFields, fieldOptions } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { decrypt } from '$lib/server/utils/crypto';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
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
		for (const field of allFields) {
			if (field.isEncrypted && values[field.key]) {
				try {
					values[field.key] = decrypt(values[field.key]);
				} catch (e) {
					console.error(`Failed to decrypt field ${field.key}:`, e);
				}
			}
		}
		existingDraft.customFieldValues = JSON.stringify(values);
	}

	return {
		draft: existingDraft,
		customFields: allFields,
		tenantSlug: params.tenant
	};
};

export const actions = {
	submitApplication: async ({ locals, params }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		try {
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

			// Final submission
			await db
				.update(applications)
				.set({
					status: 'submitted',
					submittedAt: new Date(),
					currentStep: 4,
					completedSteps: JSON.stringify([1, 2, 3, 4]),
					updatedAt: new Date()
				})
				.where(eq(applications.id, existingDraft.id));

			// In a real app, you might trigger email notifications here

			throw redirect(303, `/${params.tenant}/register/success`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to submit application:', error);
			return fail(500, { error: 'Gagal mengirim pendaftaran. Silakan coba lagi.' });
		}
	}
} satisfies Actions;
