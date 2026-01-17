import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { listTenantsWithStats, updateTenantStatus } from '$lib/server/domain/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const tenants = await listTenantsWithStats();
	return { tenants };
};

export const actions: Actions = {
	toggleStatus: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

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
