import { getApplicationForVerification, verifyDocument } from '$lib/server/domain/verification';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.session) throw redirect(302, '/auth/login');

	// Check permissions
	const allowedRoles = ['verifier', 'school_admin'];
	const role = locals.session.role;
	if (!role || !allowedRoles.includes(role)) {
		throw error(403, 'Unauthorized access to verification');
	}

	const tenantId = locals.tenantId;
	if (!tenantId) throw error(400, 'Tenant context missing');

	const app = await getApplicationForVerification(params.id);
	if (!app) throw error(404, 'Application not found');

	if (app.tenantId !== tenantId) throw error(403, 'Unauthorized access to this application');

	return {
		application: app
	};
};

export const actions: Actions = {
	verifyDocument: async ({ request, locals }) => {
		if (!locals.session) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const documentId = formData.get('documentId') as string;
		const action = formData.get('action') as 'approve' | 'reject' | 'request_revision';
		const reason = formData.get('reason') as string;

		if (!documentId || !action) return fail(400, { message: 'Missing fields' });

		try {
			await verifyDocument(locals.tenantId!, documentId, locals.session.userId, action, reason);
			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Verification failed' });
		}
	}
};
