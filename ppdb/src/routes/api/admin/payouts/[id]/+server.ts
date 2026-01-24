import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getPayoutDetails } from '$lib/server/domain/admin/payout';

export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const payout = await getPayoutDetails(params.id);

		if (!payout) {
			return json({ error: 'Payout not found' }, { status: 404 });
		}

		return json(payout);
	} catch (error) {
		console.error('Failed to fetch payout details:', error);
		return json({ error: 'Failed to fetch payout details' }, { status: 500 });
	}
};
