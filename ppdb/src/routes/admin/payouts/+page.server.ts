import type { PageServerLoad, Actions } from './$types';
import { listPayouts, processPayout } from '$lib/server/domain/admin/payout';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    const payouts = await listPayouts();

    return {
        payouts
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

        if (!payoutId || !status) {
            return fail(400, { message: 'Missing required fields' });
        }

        try {
            await processPayout(payoutId, status, reference, auth.userId);
            return { success: true };
        } catch (error) {
            console.error('Payout update failed:', error);
            return fail(500, { message: 'Failed to update payout' });
        }
    }
};
