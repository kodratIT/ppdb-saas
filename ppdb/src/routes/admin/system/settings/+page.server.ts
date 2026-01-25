import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	// For now, redirect to existing settings with a note that tabs have been reorganized
	// In the future, this will load only general + SMTP settings
	throw redirect(302, '/admin/settings#general');
};
