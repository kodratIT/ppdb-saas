import { db } from '$lib/server/db';
import { saasPackages, saasSubscriptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getTenants, cancelSubscription, extendTrial } from '$lib/server/domain/admin/tenants';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const packageId = url.searchParams.get('packageId') || 'all';

	const [tenantsData, packages] = await Promise.all([
		getTenants({ page, limit: 10, search, status, packageId }),
		db.select().from(saasPackages).where(eq(saasPackages.isActive, true))
	]);

	return {
		tenants: tenantsData.data,
		pagination: tenantsData.pagination,
		packages,
		filters: {
			search,
			status,
			packageId
		}
	};
};

export const actions: Actions = {
	updateSubscription: async ({ request }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;
		const packageId = formData.get('packageId') as string;
		const billingCycle = formData.get('billingCycle') as 'monthly' | 'yearly';
		const status = formData.get('status') as 'active' | 'trial' | 'past_due' | 'cancelled';
		const currentPeriodEnd = formData.get('currentPeriodEnd') as string;

		if (!tenantId || !packageId || !billingCycle || !status || !currentPeriodEnd) {
			return fail(400, { missing: true });
		}

		try {
			await db
				.insert(saasSubscriptions)
				.values({
					tenantId,
					packageId,
					billingCycle,
					status,
					currentPeriodEnd: new Date(currentPeriodEnd),
					currentPeriodStart: new Date(),
					autoRenew: true
				})
				.onConflictDoUpdate({
					target: saasSubscriptions.tenantId,
					set: {
						packageId,
						billingCycle,
						status,
						currentPeriodEnd: new Date(currentPeriodEnd),
						updatedAt: new Date()
					}
				});

			return { success: true };
		} catch (error) {
			console.error('Failed to update subscription:', error);
			return fail(500, { message: 'Failed to update subscription' });
		}
	},

	cancelSubscription: async ({ request }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;

		if (!tenantId) return fail(400, { missing: true });

		try {
			await cancelSubscription(tenantId);
			return { success: true };
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
			return fail(500, { message: 'Failed to cancel subscription' });
		}
	},

	extendTrial: async ({ request }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;
		const days = Number(formData.get('days'));

		if (!tenantId || !days) return fail(400, { missing: true });

		try {
			await extendTrial(tenantId, days);
			return { success: true };
		} catch (error) {
			console.error('Failed to extend trial:', error);
			return fail(500, { message: 'Failed to extend trial' });
		}
	}
};
