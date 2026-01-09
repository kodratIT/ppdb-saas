import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as schoolAdminsDomain from '$lib/server/domain/school-admins';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	// In a real implementation, you would get tenantId from session/auth
	// For now, we'll use a placeholder
	const tenantId = 'placeholder-tenant-id';

	// List all school admins
	const admins = await schoolAdminsDomain.listSchoolAdmins(db, tenantId);

	return {
		admins,
		tenantId
	};
};

export const actions = {
	/**
	 * Create new school admin
	 */
	createAdmin: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const name = formData.get('name') as string;
		const role = formData.get('role') as 'school_admin' | 'verifier' | 'treasurer';

		// In a real implementation, you would get tenantId from session/auth
		const tenantId = 'placeholder-tenant-id';

		try {
			await schoolAdminsDomain.createSchoolAdmin(db, tenantId, {
				email,
				name,
				role
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
	assignRole: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const role = formData.get('role') as any;

		// In a real implementation, you would get tenantId from session/auth
		const tenantId = 'placeholder-tenant-id';

		try {
			await schoolAdminsDomain.assignRoleToUser(db, tenantId, userId, role);
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
	revokeAccess: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		// In a real implementation, you would get tenantId from session/auth
		const tenantId = 'placeholder-tenant-id';

		try {
			await schoolAdminsDomain.revokeAccess(db, tenantId, userId);
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { message: error.message });
			}
			return fail(500, { message: 'Failed to revoke access' });
		}

		return { success: true };
	}
};
