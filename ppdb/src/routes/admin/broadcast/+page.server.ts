import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';
import { broadcastToAdmins } from '$lib/server/domain/admin/broadcast';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const allTenants = await db.select().from(tenants);
	return { tenants: allTenants };
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const message = formData.get('message')?.toString();
		const target = formData.get('target')?.toString(); // 'all', 'active', 'inactive'

		if (!message) return fail(400, { message: 'Message is required' });

		const broadcastResult = await broadcastToAdmins({
			status: target === 'all' ? undefined : (target as 'active' | 'inactive'),
			message
		});

		return {
			success: true,
			sentCount: broadcastResult.sentCount,
			totalAdmins: broadcastResult.totalAdmins
		};
	}
};
