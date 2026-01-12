import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, admissionPaths, customFields, fieldOptions } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { decrypt } from '$lib/server/utils/crypto';
import { step1Schema } from '$lib/schema/registration';
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

		try {
			const existingDraft = await db.query.applications.findFirst({
				where: and(
					eq(applications.userId, auth.userId),
					eq(applications.tenantId, auth.tenantId),
					eq(applications.status, 'draft')
				)
			});

			const updateData = {
				admissionPathId,
				childFullName,
				childNickname: childNickname || null,
				childDob: new Date(childDob),
				childGender,
				currentStep: 1,
				completedSteps: JSON.stringify([1]),
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
