import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // Delete session cookies
    cookies.delete('session_id', { path: '/' });
    cookies.delete('impersonator_session_id', { path: '/' });
    cookies.delete('firebase_id_token', { path: '/' });

    // Redirect to sign-in page
    throw redirect(303, '/sign-in');
};
