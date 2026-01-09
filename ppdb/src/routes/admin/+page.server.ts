import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { createTenant, listTenants } from '$lib/server/domain/admin';

export const load: PageServerLoad = async () => {
	const tenants = await listTenants();
	return { tenants };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const slug = data.get('slug');

		if (!name || typeof name !== 'string') {
			return fail(400, { missing: true, message: 'Name is required' });
		}
		if (!slug || typeof slug !== 'string') {
			return fail(400, { missing: true, message: 'Slug is required' });
		}

		try {
			// TODO: Get real actor ID from session/auth
			const actorId = 'super-admin-placeholder';
			await createTenant({ name, slug }, actorId);
			return { success: true };
		} catch (error) {
			console.error('Failed to create tenant:', error);
			return fail(500, { error: true, message: 'Failed to create tenant' });
		}
	}
};
