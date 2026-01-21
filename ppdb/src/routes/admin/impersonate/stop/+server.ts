import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { logImpersonationEnd } from '$lib/server/auth/impersonation';
import { validateSession } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	// 1. Check if we have an impersonator session stored
	const impersonatorSessionId = cookies.get('impersonator_session_id');

	if (!impersonatorSessionId) {
		// Not impersonating, just redirect home
		throw redirect(303, '/');
	}

	try {
		// 2. Validate original session to get impersonator ID
		const originalSession = await validateSession(impersonatorSessionId);

		// 3. Log the impersonation end
		// locals.userId is currently the impersonated user
		if (locals.userId) {
			await logImpersonationEnd(originalSession.userId, locals.userId, impersonatorSessionId);
		}

		// 4. Restore the original session
		cookies.set('session_id', impersonatorSessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		// 5. Clear the impersonation cookie
		cookies.delete('impersonator_session_id', { path: '/' });

		// 6. Redirect back to Super Admin Schools page
		throw redirect(303, '/admin/schools');
	} catch (error) {
		if (error instanceof Response) throw error; // handle redirect

		// If session is invalid, clear everything and go to sign-in
		cookies.delete('session_id', { path: '/' });
		cookies.delete('impersonator_session_id', { path: '/' });
		throw redirect(303, '/sign-in');
	}
};
