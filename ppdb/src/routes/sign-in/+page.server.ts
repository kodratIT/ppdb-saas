import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { authenticateFirebaseUser } from '$lib/server/auth/firebase';
import { createSession } from '$lib/server/auth/session';
import { AuthError } from '$lib/server/auth/types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
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

			if (!locals.tenantId) {
				return fail(403, { error: 'Tenant context not found' });
			}

			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.firebaseUid, firebaseUser.uid))
				.limit(1);

			if (existingUsers.length === 0) {
				return fail(404, { error: 'User not found' });
			}

			const user = existingUsers[0];

			const session = await createSession({
				userId: user.id,
				tenantId: locals.tenantId,
				authType: 'firebase',
				authIdentifier: firebaseUser.uid
			});

			cookies.set('session_id', session.id, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
				maxAge: session.expiresAt.getTime() - Date.now()
			});

			// Redirect based on role
			const role = session.role || 'parent';

			if (role === 'super_admin') {
				throw redirect(302, '/admin');
			}

			const slug = locals.tenant?.slug;
			if (!slug) {
				throw redirect(302, '/'); // Should not happen if tenantId check passed
			}

			if (['school_admin', 'verifier', 'treasurer', 'interviewer'].includes(role)) {
				throw redirect(302, `/${slug}/admin`);
			} else {
				// Parent
				throw redirect(302, `/${slug}/dashboard`);
			}
		} catch (error) {
			if (error instanceof AuthError) {
				if (error.statusCode === 401) {
					return fail(error.statusCode, { error: 'Authentication failed' });
				}
				return fail(error.statusCode, { error: error.message });
			}
			
			console.error('Sign-in error:', error);
			return fail(500, { error: 'An error occurred during sign-in' });
		}
	}
};
