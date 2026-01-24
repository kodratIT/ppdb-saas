import { db } from '$lib/server/db';
import { saasPackages, saasSubscriptions } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, sql, and, ne } from 'drizzle-orm';
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

export const load: PageServerLoad = async ({ params, locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const pkg = await db.query.saasPackages.findFirst({
		where: eq(saasPackages.id, params.id)
	});

	if (!pkg) throw error(404, 'Package not found');

	// Get subscriber count
	const subCountResult = await db
		.select({
			count: sql<number>`cast(count(${saasSubscriptions.id}) as integer)`
		})
		.from(saasSubscriptions)
		.where(
			and(eq(saasSubscriptions.packageId, params.id), ne(saasSubscriptions.status, 'cancelled'))
		);

	return {
		pkg,
		subscriberCount: subCountResult[0]?.count || 0
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
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

		const { subscriberCount, useVersioning } = formData;
		const hasSubscribers = parseInt(subscriberCount as string) > 0;
		const shouldVersion = useVersioning === 'true' && hasSubscribers;

		try {
			if (shouldVersion) {
				// Grandfathering: Archive old, create new
				await db.transaction(async (tx) => {
					// 1. Archive current package
					await tx
						.update(saasPackages)
						.set({ isActive: false, updatedAt: new Date() })
						.where(eq(saasPackages.id, params.id));

					// 2. Create new package version
					await tx.insert(saasPackages).values({
						...result.data,
						createdAt: new Date(),
						updatedAt: new Date()
					});
				});
			} else {
				// Standard Update
				await db
					.update(saasPackages)
					.set({
						...result.data,
						updatedAt: new Date()
					})
					.where(eq(saasPackages.id, params.id));
			}
		} catch (e: any) {
			if (e.message?.includes('unique constraint')) {
				return fail(400, {
					errors: { slug: ['Slug already exists. Try changing the slug for the new version.'] },
					data: formData
				});
			}
			throw e;
		}

		throw redirect(303, '/admin/subscription/packages');
	}
};
