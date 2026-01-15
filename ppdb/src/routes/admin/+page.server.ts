import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDashboardStats } from '$lib/server/domain/admin';
import { invalidateSession } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/sign-in');
	}

	const stats = await getDashboardStats();
	return { stats };
};

export const actions: Actions = {
	signout: async ({ cookies, locals }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
			cookies.delete('session_id', { path: '/' });
			cookies.delete('firebase_id_token', { path: '/' });
		}
		throw redirect(302, '/sign-in');
	}
};
