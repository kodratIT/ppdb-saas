import { db } from '$lib/server/db';
import { saasPackages } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const packages = await db.select().from(saasPackages).orderBy(saasPackages.priceMonthly);

	return {
		packages
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const description = formData.get('description') as string;
		const priceMonthly = Number(formData.get('priceMonthly'));
		const priceYearly = Number(formData.get('priceYearly'));
		// Handle JSON fields - assuming they are passed as JSON strings for simplicity in this MVP
		// In a real UI, we might construct this on client side or use array inputs
		const limitsStr = (formData.get('limits') as string) || '{}';
		const featuresStr = (formData.get('features') as string) || '[]';

		if (!name || !slug) {
			return fail(400, { missing: true });
		}

		try {
			await db.insert(saasPackages).values({
				name,
				slug,
				description,
				priceMonthly,
				priceYearly,
				limits: JSON.parse(limitsStr),
				features: JSON.parse(featuresStr),
				isActive: true
			});

			return { success: true };
		} catch (error) {
			console.error('Failed to create package:', error);
			return fail(500, { message: 'Failed to create package' });
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const description = formData.get('description') as string;
		const priceMonthly = Number(formData.get('priceMonthly'));
		const priceYearly = Number(formData.get('priceYearly'));
		const limitsStr = (formData.get('limits') as string) || '{}';
		const featuresStr = (formData.get('features') as string) || '[]';

		if (!id) {
			return fail(400, { missing: true });
		}

		try {
			await db
				.update(saasPackages)
				.set({
					name,
					slug,
					description,
					priceMonthly,
					priceYearly,
					limits: JSON.parse(limitsStr),
					features: JSON.parse(featuresStr),
					updatedAt: new Date()
				})
				.where(eq(saasPackages.id, id));

			return { success: true };
		} catch (error) {
			console.error('Failed to update package:', error);
			return fail(500, { message: 'Failed to update package' });
		}
	},

	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const isActive = formData.get('isActive') === 'true';

		if (!id) return fail(400, { missing: true });

		try {
			await db
				.update(saasPackages)
				.set({ isActive, updatedAt: new Date() })
				.where(eq(saasPackages.id, id));
			return { success: true };
		} catch (error) {
			return fail(500, { message: 'Failed to toggle status' });
		}
	}
};
