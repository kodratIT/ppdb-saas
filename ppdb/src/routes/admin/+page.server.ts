import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, error as svelteError } from '@sveltejs/kit';
import { createTenant, listTenants } from '$lib/server/domain/admin';
import { invalidateSession } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/sign-in');
	}

	const tenants = await listTenants();
	return { tenants };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.session || !locals.userId) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

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
			const actorId = locals.userId;
			await createTenant({ name, slug }, actorId);
			return { success: true };
		} catch (error) {
			console.error('Failed to create tenant:', error);
			return fail(500, { error: true, message: 'Failed to create tenant' });
		}
	},
	signout: async ({ cookies, locals }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
			cookies.delete('session_id', { path: '/' });
			cookies.delete('firebase_id_token', { path: '/' });
		}
		throw redirect(302, '/sign-in');
	}
};
