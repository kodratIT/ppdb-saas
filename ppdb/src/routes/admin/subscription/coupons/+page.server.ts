import { db } from '$lib/server/db';
import { saasCoupons } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const coupons = await db.query.saasCoupons.findMany({
		orderBy: [desc(saasCoupons.createdAt)]
	});

	return {
		coupons
	};
};

export const actions: Actions = {
	toggleStatus: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const isActive = formData.get('isActive') === 'true';

		if (!id) return fail(400, { message: 'ID is required' });

		await db.update(saasCoupons)
			.set({ isActive: !isActive, updatedAt: new Date() })
			.where(eq(saasCoupons.id, id));

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { message: 'ID is required' });

		await db.delete(saasCoupons).where(eq(saasCoupons.id, id));

		return { success: true };
	}
};
