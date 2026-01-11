import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await requireAuth(locals);
	await requireRole(locals, 'parent');

	const paths = await db.query.admissionPaths.findMany({
		where: and(eq(admissionPaths.tenantId, session.tenantId), eq(admissionPaths.status, 'open'))
	});

	const existingDraft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, session.userId),
			eq(applications.tenantId, session.tenantId),
			eq(applications.status, 'draft')
		)
	});

	return {
		admissionPaths: paths,
		draft: existingDraft || null,
		tenantSlug: params.tenant
	};
};

export const actions = {
	saveDraft: async ({ request, locals, params }) => {
		const session = await requireAuth(locals);
		await requireRole(locals, 'parent');

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
				eq(admissionPaths.tenantId, session.tenantId),
				eq(admissionPaths.status, 'open')
			)
		});

		if (!path) {
			return fail(400, { error: 'Jalur pendaftaran tidak valid' });
		}

		try {
			const existingDraft = await db.query.applications.findFirst({
				where: and(
					eq(applications.userId, session.userId),
					eq(applications.tenantId, session.tenantId),
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
					tenantId: session.tenantId,
					userId: session.userId,
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
