import { db } from '$lib/server/db';
import { saasPackages, saasSubscriptions } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	// Fetch all packages
	const packages = await db.query.saasPackages.findMany({
		orderBy: [desc(saasPackages.createdAt)]
	});

	// Fetch subscription counts grouped by packageId for active/trial subs
	// We use a raw query or a separate groupBy query for robustness
	const activeSubs = await db
		.select({
			packageId: saasSubscriptions.packageId,
			count: sql<number>`cast(count(${saasSubscriptions.id}) as integer)`
		})
		.from(saasSubscriptions)
		.where(inArray(saasSubscriptions.status, ['active', 'trial']))
		.groupBy(saasSubscriptions.packageId);

	// Map counts to package ID
	const subCounts = new Map<string, number>();
	activeSubs.forEach((row) => {
		if (row.packageId) subCounts.set(row.packageId, row.count);
	});

	// Enrich packages with stats
	const enrichedPackages = packages.map((pkg) => {
		const subscriberCount = subCounts.get(pkg.id) || 0;
		return {
			...pkg,
			subscriberCount
		};
	});

	// Calculate summary stats
	const totalPackages = packages.length;
	const activeSubscriptions = enrichedPackages.reduce((sum, pkg) => sum + pkg.subscriberCount, 0);
	const totalRevenueMonthly = enrichedPackages.reduce(
		(sum, pkg) => sum + pkg.priceMonthly * pkg.subscriberCount,
		0
	);

	return {
		packages: enrichedPackages,
		stats: {
			totalPackages,
			activeSubscriptions,
			totalRevenueMonthly
		}
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

		await db.update(saasPackages)
			.set({ isActive: !isActive, updatedAt: new Date() })
			.where(eq(saasPackages.id, id));

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { message: 'ID is required' });

		// Check if package is in use (optional but recommended)
		// For now, let's just delete
		await db.delete(saasPackages).where(eq(saasPackages.id, id));

		return { success: true };
	}
};
