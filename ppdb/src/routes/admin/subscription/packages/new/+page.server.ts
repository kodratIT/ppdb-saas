import { db } from '$lib/server/db';
import { saasPackages } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

const packageSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
	description: z.string().optional(),
	priceMonthly: z.coerce.number().min(0),
	priceYearly: z.coerce.number().min(0),
	isActive: z.coerce.boolean().default(true),
	features: z.string().transform((str) => JSON.parse(str)),
	limits: z.string().transform((str) => JSON.parse(str))
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const copyFromId = url.searchParams.get('copy_from');
	let initialData = null;

	if (copyFromId) {
		const sourcePkg = await db.query.saasPackages.findFirst({
			where: eq(saasPackages.id, copyFromId)
		});
		if (sourcePkg) {
			initialData = {
				...sourcePkg,
				name: `${sourcePkg.name} (Copy)`,
				slug: `${sourcePkg.slug}-copy`
			};
		}
	}

	return {
		initialData
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = Object.fromEntries(await request.formData());
		const result = packageSchema.safeParse({
			...formData,
			isActive: formData.isActive === 'on' || formData.isActive === 'true'
		});

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				data: formData
			});
		}

		try {
			await db.insert(saasPackages).values({
				...result.data,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (e: any) {
			if (e.message?.includes('unique constraint')) {
				return fail(400, {
					errors: { slug: ['Slug already exists. Please use a unique slug.'] },
					data: formData
				});
			}
			throw e;
		}

		throw redirect(303, '/admin/subscription/packages');
	}
};
