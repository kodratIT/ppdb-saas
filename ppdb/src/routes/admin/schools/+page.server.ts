import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { listTenantsWithStats, updateTenantStatus } from '$lib/server/domain/admin';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireRole(auth, 'super_admin');

	const tenants = await listTenantsWithStats();
	return { tenants };
};

export const actions: Actions = {
	toggleStatus: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireRole(auth, 'super_admin');

		const formData = await request.formData();
		const tenantId = formData.get('tenantId')?.toString();
		const currentStatus = formData.get('currentStatus')?.toString();

		if (!tenantId || !currentStatus) {
			return fail(400, { message: 'Missing data' });
		}

		const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
		await updateTenantStatus(tenantId, newStatus, auth.userId);

		return { success: true };
	}
};
