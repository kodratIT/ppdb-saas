import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, admissionPaths, customFields, fieldOptions } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { decrypt } from '$lib/server/utils/crypto';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const paths = await db.query.admissionPaths.findMany({
		where: and(eq(admissionPaths.tenantId, auth.tenantId), eq(admissionPaths.status, 'open'))
	});

	const existingDraft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'draft')
		)
	});

	// Fetch custom fields for step 1
	const stepFields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, auth.tenantId),
			existingDraft ? eq(customFields.admissionPathId, existingDraft.admissionPathId) : undefined,
			eq(customFields.step, 1)
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
		admissionPaths: paths,
		draft: existingDraft || null,
		customFields: stepFields,
		tenantSlug: params.tenant
	};
};

export const actions = {
	saveDraft: async ({ request, locals, params }) => {
		const auth = await requireAuth(locals);
		await requireRole(auth, 'parent');

		const data = await request.formData();
		const admissionPathId = data.get('admissionPathId')?.toString();
		const childFullName = data.get('childFullName')?.toString();
		const childNickname = data.get('childNickname')?.toString();
		const childDob = data.get('childDob')?.toString();
		const childGender = data.get('childGender')?.toString();

		if (!admissionPathId) {
			return fail(400, { error: 'Jalur pendaftaran wajib dipilih' });
		}

		if (!childFullName) {
			return fail(400, { error: 'Nama lengkap anak wajib diisi' });
		}

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

			if (existingDraft) {
				await db
					.update(applications)
					.set({
						admissionPathId,
						childFullName,
						childNickname: childNickname || null,
						childDob: childDob ? new Date(childDob) : null,
						childGender: childGender || null,
						currentStep: 1,
						completedSteps: JSON.stringify([1]),
						updatedAt: new Date()
					})
					.where(eq(applications.id, existingDraft.id));
			} else {
				await db.insert(applications).values({
					tenantId: auth.tenantId,
					userId: auth.userId,
					admissionPathId,
					childFullName,
					childNickname: childNickname || null,
					childDob: childDob ? new Date(childDob) : null,
					childGender: childGender || null,
					status: 'draft',
					currentStep: 1,
					completedSteps: JSON.stringify([1])
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
