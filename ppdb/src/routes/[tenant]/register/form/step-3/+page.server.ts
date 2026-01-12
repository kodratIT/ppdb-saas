import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, customFields, fieldOptions } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { decrypt } from '$lib/server/utils/crypto';
import { step3Schema } from '$lib/schema/registration';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	// ... existing load logic
};

export const actions = {
	saveDraft: async ({ request, locals, params }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const formData = await request.formData();
		const values = Object.fromEntries(formData.entries());

		// Validate with Zod
		const result = step3Schema.safeParse(values);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				error: Object.values(errors).flat()[0],
				errors
			});
		}

		const { address, city, province, postalCode } = result.data;

		// Custom fields from form
		const customFieldValues: Record<string, any> = {};
		formData.forEach((value, key) => {
			if (!['address', 'city', 'province', 'postalCode'].includes(key)) {
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
			if (!completedSteps.includes(3)) completedSteps.push(3);

			await db
				.update(applications)
				.set({
					address,
					city,
					province,
					postalCode: postalCode || null,
					customFieldValues: JSON.stringify(updatedValues),
					currentStep: 3,
					completedSteps: JSON.stringify(completedSteps),
					updatedAt: new Date()
				})
				.where(eq(applications.id, existingDraft.id));

			throw redirect(303, `/${params.tenant}/register/form/step-4`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to save draft step 3:', error);
			return fail(500, { error: 'Gagal menyimpan data. Silakan coba lagi.' });
		}
	}
} satisfies Actions;
