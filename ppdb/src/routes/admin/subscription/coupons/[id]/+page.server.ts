import { db } from '$lib/server/db';
import { saasCoupons } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

const couponSchema = z.object({
	code: z.string().min(1, 'Code is required').toUpperCase(),
	type: z.enum(['percentage', 'fixed_amount']),
	value: z.coerce.number().min(1, 'Value must be greater than 0'),
	maxRedemptions: z.coerce.number().nullable().optional(),
	expiresAt: z.string().nullable().optional().transform(v => v ? new Date(v) : null),
	isActive: z.coerce.boolean().default(true)
});

export const load: PageServerLoad = async ({ params, locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const coupon = await db.query.saasCoupons.findFirst({
		where: eq(saasCoupons.id, params.id)
	});

	if (!coupon) throw error(404, 'Coupon not found');

	return {
		coupon
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = Object.fromEntries(await request.formData());
		const result = couponSchema.safeParse({
			...formData,
			isActive: formData.isActive === 'on'
		});

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				data: formData
			});
		}

		try {
			await db.update(saasCoupons)
				.set({
					...result.data,
					maxRedemptions: result.data.maxRedemptions || null,
					updatedAt: new Date()
				})
				.where(eq(saasCoupons.id, params.id));
		} catch (e: any) {
			if (e.message?.includes('unique constraint')) {
				return fail(400, {
					errors: { code: ['Coupon code already exists'] },
					data: formData
				});
			}
			throw e;
		}

		throw redirect(303, '/admin/subscription/coupons');
	}
};
