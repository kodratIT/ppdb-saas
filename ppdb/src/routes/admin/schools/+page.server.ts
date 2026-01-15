import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listTenants } from '$lib/server/domain/admin';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/sign-in');
	}

	const tenants = await listTenants();
	return { tenants };
};

