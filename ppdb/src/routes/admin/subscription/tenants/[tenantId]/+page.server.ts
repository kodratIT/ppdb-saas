import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	getTenantDetails,
	cancelSubscription,
	extendTrial
} from '$lib/server/domain/admin/tenants';
import { db } from '$lib/server/db';
import { saasPackages, saasSubscriptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const tenantId = params.tenantId;

	const [tenantData, packages] = await Promise.all([
		getTenantDetails(tenantId),
		db.select().from(saasPackages).where(eq(saasPackages.isActive, true))
	]);

	if (!tenantData) {
		error(404, 'Tenant not found');
	}

	return {
		tenantData,
		packages
	};
};

export const actions: Actions = {
	updateSubscription: async ({ request, params }) => {
		const formData = await request.formData();
		const tenantId = params.tenantId;
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
			return fail(500, { message: 'admin.tenants.subUpdateFailed' });
		}
	},

	cancelSubscription: async ({ params }) => {
		const tenantId = params.tenantId;
		if (!tenantId) return fail(400, { missing: true });

		try {
			await cancelSubscription(tenantId);
			return { success: true };
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
			return fail(500, { message: 'admin.tenants.subCancelFailed' });
		}
	},

	extendTrial: async ({ request, params }) => {
		const formData = await request.formData();
		const tenantId = params.tenantId;
		const days = Number(formData.get('days'));

		if (!tenantId || !days) return fail(400, { missing: true });

		try {
			await extendTrial(tenantId, days);
			return { success: true };
		} catch (error) {
			console.error('Failed to extend trial:', error);
			return fail(500, { message: 'admin.tenants.subExtendFailed' });
		}
	}
};
