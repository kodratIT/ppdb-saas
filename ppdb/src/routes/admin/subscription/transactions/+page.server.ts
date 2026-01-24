import { db } from '$lib/server/db';
import { saasInvoices, saasSubscriptions, tenants } from '$lib/server/db/schema';
import { desc, eq, and, or, ilike, sum, count, sql, inArray, lt } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const status = url.searchParams.get('status') || 'all';

	const filters = [];

	if (search) {
		filters.push(or(ilike(tenants.name, `%${search}%`), ilike(tenants.slug, `%${search}%`)));
	}

	if (status && status !== 'all') {
		filters.push(eq(saasInvoices.status, status as any));
	}

	const [invoices, allTenants, stats] = await Promise.all([
		db
			.select({
				invoice: saasInvoices,
				tenant: tenants,
				subscription: saasSubscriptions
			})
			.from(saasInvoices)
			.leftJoin(saasSubscriptions, eq(saasInvoices.subscriptionId, saasSubscriptions.id))
			.leftJoin(tenants, eq(saasInvoices.tenantId, tenants.id))
			.where(and(...filters))
			.orderBy(desc(saasInvoices.createdAt)),
		db.select({ id: tenants.id, name: tenants.name, slug: tenants.slug }).from(tenants),
		db
			.select({
				totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${saasInvoices.status} = 'paid' THEN ${saasInvoices.amount} ELSE 0 END), 0)`,
				pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN ${saasInvoices.status} = 'pending' THEN ${saasInvoices.amount} ELSE 0 END), 0)`,
				overdueCount: sql<number>`COUNT(CASE WHEN ${saasInvoices.status} = 'pending' AND ${saasInvoices.dueDate} < CURRENT_DATE THEN 1 END)`
			})
			.from(saasInvoices)
	]);

	return {
		invoices,
		tenants: allTenants,
		stats: stats[0],
		filters: {
			search,
			status
		}
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const tenantId = formData.get('tenantId') as string;
		const amount = Number(formData.get('amount'));
		const dueDate = formData.get('dueDate') as string;
		const notes = formData.get('notes') as string;

		if (!tenantId || !amount || !dueDate) {
			return fail(400, { missing: true });
		}

		try {
			// Find active subscription for this tenant
			const subscription = await db.query.saasSubscriptions.findFirst({
				where: eq(saasSubscriptions.tenantId, tenantId)
			});

			await db.insert(saasInvoices).values({
				tenantId,
				subscriptionId: subscription?.id,
				amount,
				status: 'pending',
				dueDate: new Date(dueDate),
				notes
			});

			return { success: true };
		} catch (error) {
			console.error('Failed to create invoice:', error);
			return fail(500, { message: 'Failed to create invoice' });
		}
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const status = formData.get('status') as 'pending' | 'paid' | 'void';
		const notes = formData.get('notes') as string;

		if (!id || !status) {
			return fail(400, { missing: true });
		}

		try {
			const updateData: any = {
				status,
				notes: notes || undefined
			};

			// If marking as paid, set the paidAt timestamp
			if (status === 'paid') {
				updateData.paidAt = new Date();
			} else if (status === 'pending') {
				updateData.paidAt = null;
			}

			await db.update(saasInvoices).set(updateData).where(eq(saasInvoices.id, id));

			return { success: true };
		} catch (error) {
			console.error('Failed to update invoice status:', error);
			return fail(500, { message: 'Failed to update status' });
		}
	},

	bulkUpdateStatus: async ({ request }) => {
		const formData = await request.formData();
		const ids = JSON.parse(formData.get('ids') as string);
		const status = formData.get('status') as 'paid' | 'void' | 'pending';

		if (!ids || !ids.length || !status) {
			return fail(400, { missing: true });
		}

		try {
			const updateData: any = { status };
			if (status === 'paid') {
				updateData.paidAt = new Date();
			} else if (status === 'pending') {
				updateData.paidAt = null;
			}

			await db.update(saasInvoices).set(updateData).where(inArray(saasInvoices.id, ids));

			return { success: true };
		} catch (error) {
			console.error('Bulk update failed:', error);
			return fail(500, { message: 'Bulk update failed' });
		}
	},

	bulkDelete: async ({ request }) => {
		const formData = await request.formData();
		const ids = JSON.parse(formData.get('ids') as string);

		if (!ids || !ids.length) {
			return fail(400, { missing: true });
		}

		try {
			await db.delete(saasInvoices).where(inArray(saasInvoices.id, ids));
			return { success: true };
		} catch (error) {
			console.error('Bulk delete failed:', error);
			return fail(500, { message: 'Bulk delete failed' });
		}
	}
};
