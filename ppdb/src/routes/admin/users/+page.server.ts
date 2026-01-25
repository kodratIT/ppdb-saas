import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listAdminUsers } from '$lib/server/domain/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    // Redirect to new system users page
    throw redirect(302, '/admin/system/users');

    const adminUsers = await listAdminUsers();

    return {
        users: adminUsers
    };
};
