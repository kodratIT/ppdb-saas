import { db } from '$lib/server/db';
import { saasInvoices, saasSubscriptions, tenants } from '$lib/server/db/schema';
import { desc, eq, and, or, ilike } from 'drizzle-orm';
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

	const [invoices, allTenants] = await Promise.all([
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
		db.select({ id: tenants.id, name: tenants.name, slug: tenants.slug }).from(tenants)
	]);

	return {
		invoices,
		tenants: allTenants,
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
	}
};
