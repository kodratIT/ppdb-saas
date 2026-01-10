import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createFirebaseUser, authenticateFirebaseUser } from '$lib/server/auth/firebase';
import { createSession } from '$lib/server/auth/session';
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

			const userId = firebaseUser.uid;

			const session = await createSession({
				userId,
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
		} catch (error) {
			if (error instanceof AuthError) {
				if (error.statusCode === 401) {
					return fail(error.statusCode, { error: 'Authentication failed' });
				}
				return fail(error.statusCode, { error: error.message });
			}
			if (error instanceof Response) {
				throw error;
			}

			console.error('Sign-in error:', error);
			return fail(500, { error: 'An error occurred during sign-in' });
		}
	}
};
