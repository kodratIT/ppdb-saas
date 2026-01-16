import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, customFields, fieldOptions } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { step2Schema } from '$lib/schema/registration';
import {
	processCustomFieldsForSave,
	processCustomFieldsForDisplay,
	getCustomFieldsForStep
} from '$lib/server/utils/custom-fields';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const draft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'draft')
		)
	});

	if (!draft) {
		throw redirect(303, `/${params.tenant}/register/form/step-1`);
	}

	// Fetch fields for this step
	const step2CustomFields = await getCustomFieldsForStep(auth.tenantId, draft.admissionPathId, 2);

	let processedDraft = draft;
	if (draft.customFieldValues) {
		const values = JSON.parse(draft.customFieldValues);
		const decryptedValues = await processCustomFieldsForDisplay(
			auth.tenantId,
			draft.admissionPathId,
			values
		);
		// @ts-ignore
		processedDraft = { ...draft, customFieldValues: decryptedValues };
	}

	return {
		draft: processedDraft,
		customFields: step2CustomFields
	};
};

export const actions = {
	saveDraft: async ({ request, locals, params }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const formData = await request.formData();
		const values = Object.fromEntries(formData.entries());

		// Validate with Zod
		const result = step2Schema.safeParse(values);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				error: Object.values(errors).flat()[0],
				errors
			});
		}

		const { parentFullName, parentPhone, parentEmail } = result.data;

		// Get existing draft to know admissionPathId
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

		// Handle Custom Fields (Encrypt if needed)
		// Filter out base fields first to avoid passing them as custom fields
		const customFieldInput: Record<string, any> = {};
		Object.keys(values).forEach((key) => {
			if (!['parentFullName', 'parentPhone', 'parentEmail'].includes(key)) {
				customFieldInput[key] = values[key];
			}
		});

		const encryptedCustomFields = await processCustomFieldsForSave(
			auth.tenantId,
			existingDraft.admissionPathId,
			customFieldInput
		);

		try {
			// Merge custom fields
			const currentValues = existingDraft.customFieldValues
				? JSON.parse(existingDraft.customFieldValues)
				: {};

			const updatedValues = { ...currentValues, ...encryptedCustomFields };

			const completedSteps = JSON.parse(existingDraft.completedSteps || '[]');
			if (!completedSteps.includes(2)) completedSteps.push(2);

			await db
				.update(applications)
				.set({
					parentFullName,
					parentPhone,
					parentEmail: parentEmail || null,
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
