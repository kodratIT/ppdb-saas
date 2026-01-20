import { db } from '$lib/server/db';
import { tenants, saasSubscriptions, saasPackages, applications } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const [rows, packages] = await Promise.all([
		db
			.select({
				tenant: tenants,
				subscription: saasSubscriptions,
				package: saasPackages,
				applicationCount: sql<number>`(SELECT count(*) FROM ${applications} WHERE ${applications.tenantId} = ${tenants.id})`.mapWith(Number)
			})
			.from(tenants)
			.leftJoin(saasSubscriptions, eq(saasSubscriptions.tenantId, tenants.id))
			.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
			.orderBy(tenants.createdAt),
		db.select().from(saasPackages).where(eq(saasPackages.isActive, true))
	]);

	return {
		tenants: rows,
		packages
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
			// Upsert subscription
			await db
				.insert(saasSubscriptions)
				.values({
					tenantId,
					packageId,
					billingCycle,
					status,
					currentPeriodEnd: new Date(currentPeriodEnd),
					currentPeriodStart: new Date(), // Reset start date on manual update
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
	}
};
