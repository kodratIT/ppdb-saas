import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { step1Schema } from '$lib/schema/registration';
import {
	processCustomFieldsForSave,
	processCustomFieldsForDisplay,
	getCustomFieldsForStep
} from '$lib/server/utils/custom-fields';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const unitId = url.searchParams.get('unit_id');

	const activePaths = await db.query.admissionPaths.findMany({
		where: and(
			eq(admissionPaths.tenantId, auth.tenantId),
			eq(admissionPaths.status, 'open'),
			unitId ? eq(admissionPaths.unitId, unitId) : undefined
		)
	});

	const draft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'draft')
		)
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let step1CustomFields: any[] = [];
	let processedDraft = draft;

	if (draft) {
		// If draft exists, fetch fields for its path
		step1CustomFields = await getCustomFieldsForStep(auth.tenantId, draft.admissionPathId, 1);

		// Decrypt custom values
		if (draft.customFieldValues) {
			const values = JSON.parse(draft.customFieldValues);
			const decryptedValues = await processCustomFieldsForDisplay(
				auth.tenantId,
				draft.admissionPathId,
				values
			);
			// @ts-expect-error - processedDraft includes decrypted custom fields which might not match exact schema types
			processedDraft = { ...draft, customFieldValues: decryptedValues };
		}
	} else if (activePaths.length === 1) {
		// Pre-fetch fields if only one path is available
		step1CustomFields = await getCustomFieldsForStep(auth.tenantId, activePaths[0].id, 1);
	}

	return {
		admissionPaths: activePaths,
		draft: processedDraft,
		customFields: step1CustomFields,
		unitId
	};
};

export const actions = {
	saveDraft: async ({ request, locals, params, url }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const unitId = url.searchParams.get('unit_id');

		const formData = await request.formData();
		const values = Object.fromEntries(formData.entries());

		// Validate with Zod
		const result = step1Schema.safeParse(values);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				error: Object.values(errors).flat()[0],
				errors
			});
		}

		const { admissionPathId, childFullName, childNickname, childDob, childGender } = result.data;

		const path = await db.query.admissionPaths.findFirst({
			where: and(
				eq(admissionPaths.id, admissionPathId),
				eq(admissionPaths.tenantId, auth.tenantId),
				eq(admissionPaths.status, 'open')
			)
		});

		if (!path) {
			return fail(400, { error: 'Jalur pendaftaran tidak valid' });
		}

		// Handle Custom Fields (Encrypt if needed)
		const encryptedCustomFields = await processCustomFieldsForSave(
			auth.tenantId,
			admissionPathId,
			values
		);

		try {
			const existingDraft = await db.query.applications.findFirst({
				where: and(
					eq(applications.userId, auth.userId),
					eq(applications.tenantId, auth.tenantId),
					eq(applications.status, 'draft')
				)
			});

			// Merge with existing custom values if any
			let mergedCustomValues = encryptedCustomFields;
			if (existingDraft && existingDraft.customFieldValues) {
				const current = JSON.parse(existingDraft.customFieldValues);
				mergedCustomValues = { ...current, ...encryptedCustomFields };
			}

			const completedSteps = existingDraft ? JSON.parse(existingDraft.completedSteps || '[]') : [1];
			if (!completedSteps.includes(1)) completedSteps.push(1);

			const updateData = {
				admissionPathId,
				unitId: path.unitId || unitId || null,
				childFullName,
				childNickname: childNickname || null,
				childDob: new Date(childDob),
				childGender,
				customFieldValues: JSON.stringify(mergedCustomValues),
				currentStep: 1,
				completedSteps: JSON.stringify(completedSteps),
				updatedAt: new Date()
			};

			if (existingDraft) {
				await db.update(applications).set(updateData).where(eq(applications.id, existingDraft.id));
			} else {
				await db.insert(applications).values({
					...updateData,
					tenantId: auth.tenantId,
					userId: auth.userId,
					status: 'draft'
				});
			}

			throw redirect(303, `/${params.tenant}/register/form/step-2`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to save draft:', error);
			return fail(500, { error: 'Gagal menyimpan data. Silakan coba lagi.' });
		}
	}
} satisfies Actions;
