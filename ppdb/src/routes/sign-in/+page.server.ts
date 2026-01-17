import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { authenticateFirebaseUser } from '$lib/server/auth/firebase';
import { createSession } from '$lib/server/auth/session';
import { AuthError } from '$lib/server/auth/types';
import { db } from '$lib/server/db';
import { users, tenants } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(302, '/admin');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || typeof email !== 'string') {
			return fail(400, { error: 'Email is required' });
		}

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password is required' });
		}

		if (!email.includes('@')) {
			return fail(400, { error: 'Invalid email format' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		try {
			const firebaseUser = await authenticateFirebaseUser(email, password);

			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.firebaseUid, firebaseUser.uid))
				.limit(1);

			if (existingUsers.length === 0) {
				return fail(404, { error: 'User not found' });
			}

			const user = existingUsers[0];

			// If we're on the root domain, only super_admins can log in
			// and they get associated with the 'admin' tenant.
			let targetTenantId = locals.tenantId;

			if (!targetTenantId) {
				if (user.role === 'super_admin') {
					// Fetch central admin tenant ID
					const centralTenant = await db.query.tenants.findFirst({
						where: eq(tenants.slug, 'admin')
					});
					if (!centralTenant) {
						return fail(500, { error: 'System configuration error: central tenant not found' });
					}
					targetTenantId = centralTenant.id;
				} else {
					return fail(403, {
						error:
							'Pendaftaran sekolah atau login admin sekolah harus melalui URL sekolah masing-masing.'
					});
				}
			} else {
				// Verify user belongs to this tenant or is super_admin
				if (user.tenantId !== targetTenantId && user.role !== 'super_admin') {
					return fail(403, { error: 'Akun Anda tidak terdaftar di sekolah ini.' });
				}
			}

			const session = await createSession({
				userId: user.id,
				tenantId: targetTenantId,
				authType: 'firebase',
				authIdentifier: firebaseUser.uid
			});

			cookies.set('session_id', session.id, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
				maxAge: 30 * 24 * 60 * 60 // 30 days
			});

			// Redirect based on role
			const role = user.role;

			if (role === 'super_admin') {
				throw redirect(302, '/admin');
			}

			const slug = locals.tenant?.slug;
			if (!slug) {
				// If we have no slug in locals but have a tenantId from user
				const tenant = await db.query.tenants.findFirst({
					where: eq(tenants.id, user.tenantId)
				});
				if (tenant) {
					if (['school_admin', 'verifier', 'treasurer', 'interviewer'].includes(role)) {
						throw redirect(302, `/${tenant.slug}/admin`);
					} else {
						throw redirect(302, `/${tenant.slug}/dashboard`);
					}
				}
				throw redirect(302, '/');
			}

			if (['school_admin', 'verifier', 'treasurer', 'interviewer'].includes(role)) {
				throw redirect(302, `/${slug}/admin`);
			} else {
				// Parent
				throw redirect(302, `/${slug}/dashboard`);
			}
		} catch (error) {
			if (isRedirect(error)) throw error;

			if (error instanceof AuthError) {
				if (error.statusCode === 401) {
					return fail(error.statusCode, { error: 'Authentication failed' });
				}
				return fail(error.statusCode, { error: error.message });
			}

			console.error('Sign-in error details:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return fail(500, { error: `Error: ${errorMessage}` });
		}
	}
};
