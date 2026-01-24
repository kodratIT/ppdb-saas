import type { PageServerLoad, Actions } from './$types';
import {
	listPayouts,
	processPayout,
	getPayoutsStats,
	getPayoutsWithFilters,
	getPayoutDetails,
	updatePayoutStatus,
	bulkUpdatePayoutStatus,
	exportPayouts
} from '$lib/server/domain/admin/payout';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	// Get query parameters for filtering
	const status = url.searchParams.get('status') || 'all';
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';
	const search = url.searchParams.get('search') || '';
	const page = parseInt(url.searchParams.get('page') || '1');

	// Get stats
	const stats = await getPayoutsStats();

	// Get filtered payouts
	const payoutsData = await getPayoutsWithFilters({
		status,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
		search: search || undefined,
		page,
		limit: 10
	});

	return {
		stats,
		payouts: payoutsData.payouts,
		pagination: payoutsData.pagination,
		filters: { status, dateFrom, dateTo, search }
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const payoutId = formData.get('payoutId')?.toString();
		const status = formData.get('status')?.toString() as any;
		const reference = formData.get('reference')?.toString() || '';
		const notes = formData.get('notes')?.toString() || '';

		if (!payoutId || !status) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			await updatePayoutStatus(
				payoutId,
				status,
				auth.userId,
				'Admin', // TODO: Fetch actual user name
				notes || undefined,
				reference || undefined
			);
			return { success: true, message: `Payout ${status} successfully` };
		} catch (err) {
			console.error('Payout update failed:', err);
			return fail(500, { message: 'Failed to update payout' });
		}
	},

	bulkUpdate: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const ids = formData.get('ids')?.toString().split(',') || [];
		const status = formData.get('status')?.toString() as any;
		const notes = formData.get('notes')?.toString() || '';

		if (!ids.length || !status) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const result = await bulkUpdatePayoutStatus(
				ids,
				status,
				auth.userId,
				'Admin', // TODO: Fetch actual user name
				notes || undefined
			);

			if (result.failed > 0) {
				return {
					success: true,
					message: `Processed ${result.success} payouts, ${result.failed} failed`,
					errors: result.errors
				};
			}

			return {
				success: true,
				message: `Successfully ${status} ${result.success} payouts`
			};
		} catch (err) {
			console.error('Bulk update failed:', err);
			return fail(500, { message: 'Failed to process bulk update' });
		}
	},

	export: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const format = (formData.get('format')?.toString() || 'csv') as 'csv' | 'json';
		const status = formData.get('status')?.toString() || 'all';
		const dateFrom = formData.get('dateFrom')?.toString() || '';
		const dateTo = formData.get('dateTo')?.toString() || '';
		const search = formData.get('search')?.toString() || '';

		try {
			const data = await exportPayouts(
				{
					status: status === 'all' ? undefined : status,
					dateFrom: dateFrom || undefined,
					dateTo: dateTo || undefined,
					search: search || undefined
				},
				format
			);

			return {
				success: true,
				data,
				format,
				filename: `payouts_${new Date().toISOString().split('T')[0]}.${format}`
			};
		} catch (err) {
			console.error('Export failed:', err);
			return fail(500, { message: 'Failed to export payouts' });
		}
	}
};
