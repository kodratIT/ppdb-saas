import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as schoolAdminsDomain from '$lib/server/domain/school-admins';
import { requireAuth, requirePermission } from '$lib/server/auth/authorization';
import { PERMISSIONS } from '$lib/server/auth/permissions';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';

export const load: PageServerLoad = async ({ locals }) => {
	const { tenantId } = requireAuth(locals);

	const admins = await schoolAdminsDomain.listSchoolAdmins(db, tenantId);

	return {
		admins,
		tenantId
	};
};

export const actions: Actions = {
	/**
	 * Create new school admin
	 */
	createAdmin: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.ADMIN_USERS_CREATE);

		const formData = await request.formData();
		const email = formData.get('email');
		const name = formData.get('name');
		const role = formData.get('role');

		if (!email || typeof email !== 'string') {
			return fail(400, { message: 'Email is required' });
		}

		if (!email.includes('@') || !email.includes('.')) {
			return fail(400, { message: 'Invalid email format' });
		}

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return fail(400, { message: 'Name is required' });
		}

		if (name.trim().length < 2) {
			return fail(400, { message: 'Name must be at least 2 characters' });
		}

		if (name.trim().length > 100) {
			return fail(400, { message: 'Name must be less than 100 characters' });
		}

		const validRoles = ['school_admin', 'verifier', 'treasurer'] as const;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!role || typeof role !== 'string' || !validRoles.includes(role as any)) {
			return fail(400, { message: 'Invalid role' });
		}

		try {
			await schoolAdminsDomain.createSchoolAdmin(db, auth.tenantId, {
				email: email.trim(),
				name: name.trim(),
				role: role as 'school_admin' | 'verifier' | 'treasurer'
			});

			await logSensitiveAction(auth.userId, 'create_admin', email.trim(), {
				name: name.trim(),
				role: role
			});
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { message: error.message });
			}
			return fail(500, { message: 'Failed to create admin' });
		}

		return { success: true };
	},

	/**
	 * Assign new role to user
	 */
	assignRole: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.ADMIN_USERS_ASSIGN_ROLE);

		const formData = await request.formData();
		const userIdParam = formData.get('userId');
		const role = formData.get('role');

		if (!userIdParam || typeof userIdParam !== 'string') {
			return fail(400, { message: 'User ID is required' });
		}

		const validRoles = ['school_admin', 'verifier', 'treasurer'] as const;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!role || typeof role !== 'string' || !validRoles.includes(role as any)) {
			return fail(400, { message: 'Invalid role' });
		}

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await schoolAdminsDomain.assignRoleToUser(db, auth.tenantId, userIdParam, role as any);

			await logSensitiveAction(auth.userId, 'assign_role', userIdParam, {
				newRole: role,
				tenantId: auth.tenantId
			});
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { message: error.message });
			}
			return fail(500, { message: 'Failed to assign role' });
		}

		return { success: true };
	},

	/**
	 * Revoke user access
	 */
	revokeAccess: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.ADMIN_USERS_REVOKE_ACCESS);

		const formData = await request.formData();
		const userIdParam = formData.get('userId');

		if (!userIdParam || typeof userIdParam !== 'string') {
			return fail(400, { message: 'User ID is required' });
		}

		try {
			await schoolAdminsDomain.revokeAccess(db, auth.tenantId, userIdParam);

			await logSensitiveAction(auth.userId, 'revoke_access', userIdParam, {
				tenantId: auth.tenantId
			});
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { message: error.message });
			}
			return fail(500, { message: 'Failed to revoke access' });
		}

		return { success: true };
	}
};
