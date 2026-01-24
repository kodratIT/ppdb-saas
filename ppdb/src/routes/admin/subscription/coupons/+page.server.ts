import { db } from '$lib/server/db';
import { saasCoupons } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { desc, eq, sql, inArray, and, gte, lt } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const [coupons, stats] = await Promise.all([
		db.select().from(saasCoupons).orderBy(desc(saasCoupons.createdAt)),
		db
			.select({
				activeCount: sql<number>`CAST(COUNT(CASE WHEN ${saasCoupons.isActive} = true AND (${saasCoupons.expiresAt} IS NULL OR ${saasCoupons.expiresAt} > NOW()) THEN 1 END) AS INTEGER)`,
				totalRedemptions: sql<number>`CAST(COALESCE(SUM(${saasCoupons.redemptionsCount}), 0) AS INTEGER)`,
				expiringSoon: sql<number>`CAST(COUNT(CASE WHEN ${saasCoupons.expiresAt} IS NOT NULL AND ${saasCoupons.expiresAt} BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 END) AS INTEGER)`
			})
			.from(saasCoupons)
	]);

	return {
		coupons,
		stats: stats[0]
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

		await db
			.update(saasCoupons)
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
	},

	bulkUpdateStatus: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const ids = JSON.parse(formData.get('ids') as string);
		const isActive = formData.get('isActive') === 'true';

		if (!ids || !ids.length) return fail(400, { message: 'IDs are required' });

		await db
			.update(saasCoupons)
			.set({ isActive, updatedAt: new Date() })
			.where(inArray(saasCoupons.id, ids));

		return { success: true };
	},

	bulkDelete: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const ids = JSON.parse(formData.get('ids') as string);

		if (!ids || !ids.length) return fail(400, { message: 'IDs are required' });

		await db.delete(saasCoupons).where(inArray(saasCoupons.id, ids));

		return { success: true };
	}
};
