import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { db } from '$lib/server/db';
import { tenants, saasSubscriptions, saasPackages, applications } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const [tenant, subscription, pkg, applicationCount] = await Promise.all([
		db.select().from(tenants).where(eq(tenants.id, params.tenantId)).then((r) => r[0]),
		db
			.select()
			.from(saasSubscriptions)
			.where(eq(saasSubscriptions.tenantId, params.tenantId))
			.then((r) => r[0]),
		db
			.select()
			.from(saasSubscriptions)
			.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
			.where(eq(saasSubscriptions.tenantId, params.tenantId))
			.then((r) => r[0]?.saasPackages),
		db
			.select({ count: sql`count(*)` })
			.from(applications)
			.where(eq(applications.tenantId, params.tenantId))
			.then((r) => Number(r[0]?.count || 0))
	]);

	if (!tenant) {
		throw new Error('Tenant not found');
	}

	return {
		tenant,
		subscription,
		package: pkg,
		applicationCount
	};
};

export const actions: Actions = {
	cancelSubscription: async ({ request, params }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;

		if (!tenantId) {
			return fail(400, { error: 'Tenant ID is required' });
		}

		try {
			await db
				.update(saasSubscriptions)
				.set({
					status: 'cancelled',
					autoRenew: false,
					updatedAt: new Date()
				})
				.where(eq(saasSubscriptions.tenantId, tenantId));

			return { success: true };
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
			return fail(500, { error: 'Failed to cancel subscription' });
		}
	},
	extendTrial: async ({ request, params }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;
		const days = formData.get('days') as string;

		if (!tenantId) {
			return fail(400, { error: 'Tenant ID is required' });
		}
		if (!days || isNaN(Number(days))) {
			return fail(400, { error: 'Days is required' });
		}
		const daysNum = Number(days);
		if (daysNum <= 0 || daysNum > 365) {
			return fail(400, { error: 'Days must be between 1 and 365' });
		}

		try {
			const currentSub = await db
				.select()
				.from(saasSubscriptions)
				.where(eq(saasSubscriptions.tenantId, tenantId))
				.then((r) => r[0]);

			if (!currentSub) {
				return fail(404, { error: 'Subscription not found' });
			}

			const currentEnd = currentSub.currentPeriodEnd || new Date();
			const newEnd = new Date(currentEnd);
			newEnd.setDate(newEnd.getDate() + daysNum);

			await db
				.update(saasSubscriptions)
				.set({
					currentPeriodEnd: newEnd,
					updatedAt: new Date()
				})
				.where(eq(saasSubscriptions.tenantId, tenantId));

			return { success: true };
		} catch (error) {
			console.error('Failed to extend trial:', error);
			return fail(500, { error: 'Failed to extend trial' });
		}
	}
};
