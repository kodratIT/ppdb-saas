import { db } from '$lib/server/db';
import { tenants, saasSubscriptions, saasInvoices, saasPackages } from '$lib/server/db/schema';
import { eq, desc, and, gte, lt, or } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	// Fetch data in parallel
	const [allSubscriptions, recentInvoices, expiringSubscriptions] = await Promise.all([
		// 1. All Active/Trial Subscriptions with Packages for Revenue Calc
		db
			.select({
				subscription: saasSubscriptions,
				package: saasPackages
			})
			.from(saasSubscriptions)
			.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
			.where(
				or(
					eq(saasSubscriptions.status, 'active'),
					eq(saasSubscriptions.status, 'trial'),
					eq(saasSubscriptions.status, 'past_due')
				)
			),

		// 2. Recent Invoices (Transactions)
		db
			.select({
				invoice: saasInvoices,
				tenant: tenants
			})
			.from(saasInvoices)
			.leftJoin(tenants, eq(saasInvoices.tenantId, tenants.id))
			.orderBy(desc(saasInvoices.createdAt))
			.limit(5),

		// 3. Expiring Subscriptions (Next 7 days)
		db
			.select({
				tenant: tenants,
				subscription: saasSubscriptions,
				package: saasPackages
			})
			.from(saasSubscriptions)
			.leftJoin(tenants, eq(saasSubscriptions.tenantId, tenants.id))
			.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
			.where(
				and(
					or(eq(saasSubscriptions.status, 'active'), eq(saasSubscriptions.status, 'trial')),
					gte(saasSubscriptions.currentPeriodEnd, new Date()),
					lt(saasSubscriptions.currentPeriodEnd, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
				)
			)
			.orderBy(saasSubscriptions.currentPeriodEnd)
			.limit(5)
	]);

	// Calculate Stats
	let mrr = 0;
	let arr = 0;
	let activeCount = 0;
	let trialCount = 0;
	let pastDueCount = 0;

	for (const row of allSubscriptions) {
		const sub = row.subscription;
		const pkg = row.package;

		if (!pkg) continue;

		if (sub.status === 'active') activeCount++;
		if (sub.status === 'trial') trialCount++;
		if (sub.status === 'past_due') pastDueCount++;

		if (sub.status === 'active' || sub.status === 'past_due') {
			if (sub.billingCycle === 'monthly') {
				mrr += pkg.priceMonthly;
				arr += pkg.priceMonthly * 12;
			} else {
				mrr += pkg.priceYearly / 12;
				arr += pkg.priceYearly;
			}
		}
	}

	return {
		stats: {
			mrr,
			arr,
			activeCount,
			trialCount,
			pastDueCount
		},
		recentInvoices,
		expiringSubscriptions
	};
};
