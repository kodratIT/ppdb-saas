import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createFirebaseUser } from '$lib/server/auth/firebase';
import { createSession } from '$lib/server/auth/session';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { AuthError } from '$lib/server/auth/types';

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
		const confirmPassword = data.get('confirmPassword');

		if (!email || typeof email !== 'string') {
			return fail(400, { error: 'Email is required' });
		}

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password is required' });
		}

		if (!confirmPassword || typeof confirmPassword !== 'string') {
			return fail(400, { error: 'Password confirmation is required' });
		}

		if (!email.includes('@')) {
			return fail(400, { error: 'Invalid email format' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (!locals.tenantId) {
			return fail(403, { error: 'Tenant context not found' });
		}

		try {
			const firebaseUser = await createFirebaseUser(email, password);
			const [newUser] = await db
				.insert(users)
				.values({
					email,
					tenantId: locals.tenantId,
					name: email.split('@')[0],
					role: 'school_admin',
					status: 'active',
					firebaseUid: firebaseUser.uid
				})
				.returning();

			if (!newUser) {
				return fail(500, { error: 'Failed to create user record' });
			}

			const session = await createSession({
				userId: newUser.id,
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

			throw redirect(302, '/admin');
		} catch (err) {
			if (err instanceof AuthError) {
				if (err.statusCode === 409) {
					return fail(409, { error: 'Email already exists' });
				}
				return fail(err.statusCode, { error: err.message });
			}
			if (err instanceof Response) {
				throw err;
			}

			console.error('Sign-up error:', err);
			return fail(500, { error: 'An error occurred during sign-up' });
		}
	}
};
