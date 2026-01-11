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

	// Fetch custom fields for step 2
	const stepFields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, auth.tenantId),
			eq(customFields.admissionPathId, existingDraft.admissionPathId),
			eq(customFields.step, 2)
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
		for (const field of stepFields) {
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
		customFields: stepFields,
		tenantSlug: params.tenant
	};
};

export const actions = {
	saveDraft: async ({ request, locals, params }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const formData = await request.formData();
		const parentFullName = formData.get('parentFullName')?.toString();
		const parentPhone = formData.get('parentPhone')?.toString();
		const parentEmail = formData.get('parentEmail')?.toString();

		// Custom fields from form
		const customFieldValues: Record<string, any> = {};
		formData.forEach((value, key) => {
			if (!['parentFullName', 'parentPhone', 'parentEmail'].includes(key)) {
				customFieldValues[key] = value;
			}
		});

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

			// Merge custom fields
			const currentValues = existingDraft.customFieldValues
				? JSON.parse(existingDraft.customFieldValues)
				: {};

			const updatedValues = { ...currentValues, ...customFieldValues };

			const completedSteps = JSON.parse(existingDraft.completedSteps || '[]');
			if (!completedSteps.includes(2)) completedSteps.push(2);

			await db
				.update(applications)
				.set({
					parentFullName: parentFullName || existingDraft.parentFullName,
					parentPhone: parentPhone || existingDraft.parentPhone,
					parentEmail: parentEmail || existingDraft.parentEmail,
					customFieldValues: JSON.stringify(updatedValues),
					currentStep: 2,
					completedSteps: JSON.stringify(completedSteps),
					updatedAt: new Date()
				})
				.where(eq(applications.id, existingDraft.id));

			throw redirect(303, `/${params.tenant}/register/form/step-3`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to save draft step 2:', error);
			return fail(500, { error: 'Gagal menyimpan data. Silakan coba lagi.' });
		}
	}
} satisfies Actions;
