import type { Handle } from '@sveltejs/kit';
import { resolveTenant } from '$lib/server/tenant';
import { validateSession, refreshSession } from '$lib/server/auth/session';
import { verifyFirebaseToken } from '$lib/server/auth/firebase';
import { SESSION_EXPIRY_SECONDS } from '$lib/server/auth/types';
import { AuthError } from '$lib/server/auth/types';

const REFRESH_THRESHOLD = 2 * 24 * 60 * 60;

export const handle: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') || '';
	let subdomain = '';

	if (host.includes('localhost') || host.includes('127.0.0.1')) {
		const parts = host.split('.');
		if (parts.length > 1 && parts[0] !== 'localhost') {
			subdomain = parts[0];
		}
	} else {
		const parts = host.split('.');
		if (parts.length > 2) {
			subdomain = parts[0];
		}
	}

	const reserved = ['www', 'app', 'api', 'admin', 'super-admin'];
	if (reserved.includes(subdomain)) {
		subdomain = '';
	}

	let tenantId: string | undefined;
	if (subdomain) {
		// Avoid Cloudflare platform emulation in local dev to prevent EPERM writes
		const platformForResolution =
			process.env.NODE_ENV === 'development' ? undefined : event.platform;
		const tenant = await resolveTenant(subdomain, platformForResolution);
		if (tenant) {
			tenantId = tenant.id;
			event.locals.tenantId = tenant.id;
			event.locals.tenant = tenant;
		} else {
			return new Response('School not found', { status: 404 });
		}
	}

	const sessionId = event.cookies.get('session_id');
	if (sessionId) {
		try {
			const session = await validateSession(sessionId);

			event.locals.session = session;
			event.locals.userId = session.userId;

			const timeUntilExpiry = (session.expiresAt.getTime() - Date.now()) / 1000;

			if (timeUntilExpiry < REFRESH_THRESHOLD) {
				const refreshed = await refreshSession(sessionId, SESSION_EXPIRY_SECONDS);
				event.locals.session = refreshed;
			}
		} catch (error) {
			if (error instanceof AuthError) {
				event.cookies.delete('session_id', { path: '/' });
			}
		}
	}

	const idToken = event.cookies.get('firebase_id_token');
	if (idToken) {
		try {
			const firebaseUser = await verifyFirebaseToken(idToken);
			event.locals.firebaseUser = firebaseUser;
		} catch (error) {
			console.error('Firebase token verification failed:', error);
		}
	}

	return resolve(event);
};
