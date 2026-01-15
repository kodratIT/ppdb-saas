import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createTenant } from '$lib/server/domain/admin';
import { createFirebaseUser } from '$lib/server/auth/firebase';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { AuthError } from '$lib/server/auth/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/sign-in');
	}

	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.session || !locals.userId) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const data = await request.formData();
		const name = data.get('name');
		const slug = data.get('slug');
		const adminEmail = data.get('adminEmail');
		const adminPassword = data.get('adminPassword');

		if (!name || typeof name !== 'string') {
			return fail(400, { missing: true, message: 'Name is required' });
		}
		if (!slug || typeof slug !== 'string') {
			return fail(400, { missing: true, message: 'Slug is required' });
		}
		if (!adminEmail || typeof adminEmail !== 'string') {
			return fail(400, { missing: true, message: 'School email is required' });
		}
		if (!adminPassword || typeof adminPassword !== 'string') {
			return fail(400, { missing: true, message: 'Admin password is required' });
		}
		if (!adminEmail.includes('@')) {
			return fail(400, { missing: true, message: 'Invalid school email format' });
		}
		if (adminPassword.length < 6) {
			return fail(400, {
				missing: true,
				message: 'Password must be at least 6 characters'
			});
		}

		try {
			const actorId = locals.userId;
			const newTenant = await createTenant({ name, slug }, actorId);

			const firebaseUser = await createFirebaseUser(adminEmail, adminPassword);

			await db
				.insert(users)
				.values({
					email: adminEmail,
					tenantId: newTenant.id,
					name,
					role: 'school_admin',
					status: 'active',
					firebaseUid: firebaseUser.uid
				})
				.returning();

			return { success: true };
		} catch (error) {
			console.error('Failed to create tenant or admin:', error);
			if (error instanceof AuthError) {
				return fail(error.statusCode, { error: true, message: error.message });
			}
			return fail(500, { error: true, message: 'Failed to create tenant or admin' });
		}
	}
};

