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
		if (locals.session.role === 'super_admin') {
			throw redirect(302, '/admin');
		}
		const slug = locals.tenant?.slug;
		if (slug) {
			throw redirect(302, `/${slug}/admin`);
		}
		throw redirect(302, '/');
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

			// GLOBAL OVERRIDE: Super Admin must ALWAYS use the 'admin' tenant
			let targetTenantId = locals.tenantId;
			let isCentralAdmin = user.role === 'super_admin';

			if (isCentralAdmin) {
				const centralTenant = await db.query.tenants.findFirst({
					where: eq(tenants.slug, 'admin')
				});
				if (!centralTenant) {
					return fail(500, { error: 'System error: central tenant not found' });
				}
				targetTenantId = centralTenant.id;
			} else {
				// Regular users must be in a tenant context
				if (!targetTenantId) {
					return fail(403, { error: 'Silakan masuk melalui URL sekolah Anda.' });
				}
				// Regular users must belong to the current tenant
				if (user.tenantId !== targetTenantId) {
					return fail(403, { error: 'Akun Anda tidak terdaftar di sekolah ini.' });
				}
			}

			const session = await createSession({
				userId: user.id,
				tenantId: targetTenantId as string,
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

			// REDIRECT LOGIC
			if (isCentralAdmin) {
				throw redirect(302, '/admin');
			}

			const slug = locals.tenant?.slug;
			if (['school_admin', 'verifier', 'treasurer', 'interviewer'].includes(user.role || '')) {
				throw redirect(302, `/${slug}/admin`);
			} else {
				throw redirect(302, `/${slug}/dashboard`);
			}
		} catch (error) {
			if (isRedirect(error)) throw error;

			if (error instanceof AuthError) {
				return fail(error.statusCode || 401, { error: error.message });
			}

			console.error('Sign-in error:', error);
			return fail(500, { error: `Error: ${error instanceof Error ? error.message : 'Unknown'}` });
		}
	}
};
