import { getVerificationQueue } from '$lib/server/domain/verification';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/auth/login');
	}

	// Check permissions (verifier, school_admin, super_admin)
	const allowedRoles = ['verifier', 'school_admin', 'super_admin'];
	if (!allowedRoles.includes(locals.session.role)) {
		throw error(403, 'Unauthorized access to verification');
	}

	const tenantId = locals.tenantId;
	if (!tenantId) throw error(400, 'Tenant context missing');

	const queue = await getVerificationQueue(tenantId);

	return {
		queue
	};
};
