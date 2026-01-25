import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logSuccess } from '$lib/server/audit-logs';

export const POST: RequestHandler = async ({ cookies, locals, request }) => {
    // Audit logging for logout
    if (locals.session) {
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await logSuccess(
            'LOGOUT',
            'USER',
            locals.session.userId,
            {
                userId: locals.session.userId,
                tenantId: locals.session.tenantId,
                details: {
                    metadata: { method: 'manual' }
                },
                ipAddress,
                userAgent
            }
        );
    }

    // Delete session cookies
    cookies.delete('session_id', { path: '/' });
    cookies.delete('impersonator_session_id', { path: '/' });
    cookies.delete('firebase_id_token', { path: '/' });

    // Redirect to sign-in page
    throw redirect(303, '/sign-in');
};
