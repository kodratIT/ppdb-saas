import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { db } from '$lib/server/db';
import { tenants, saasSubscriptions, saasPackages, applications, saasInvoices } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { 
    getTenantDetails, 
    cancelSubscription as domainCancelSubscription, 
    extendTrial as domainExtendTrial 
} from '$lib/server/domain/admin/tenants';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const tenantId = params.tenantId;

	const [tenantData, packages] = await Promise.all([
		getTenantDetails(tenantId),
		db.select().from(saasPackages).where(eq(saasPackages.isActive, true))
	]);

	if (!tenantData) {
		throw error(404, 'Tenant not found');
	}

	return {
		tenantData,
		packages
	};
};

export const actions: Actions = {
	updateSubscription: async ({ request, params, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

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
		} catch (err) {
			console.error('Failed to update subscription:', err);
			return fail(500, { error: 'Failed to update subscription' });
		}
	},

	cancelSubscription: async ({ params, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const tenantId = params.tenantId;
		if (!tenantId) return fail(400, { missing: true });

		try {
			await domainCancelSubscription(tenantId);
			return { success: true };
		} catch (err) {
			console.error('Failed to cancel subscription:', err);
			return fail(500, { error: 'Failed to cancel subscription' });
		}
	},

	extendTrial: async ({ request, params, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const tenantId = params.tenantId;
		const days = Number(formData.get('days'));

		if (!tenantId || !days) return fail(400, { missing: true });

		try {
			await domainExtendTrial(tenantId, days);
			return { success: true };
		} catch (err) {
			console.error('Failed to extend trial:', err);
			return fail(500, { error: 'Failed to extend trial' });
		}
	}
};
