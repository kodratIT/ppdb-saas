import type { Handle, RequestEvent } from '@sveltejs/kit';
import { resolveTenant } from '$lib/server/tenant';
import { validateSession, refreshSession } from '$lib/server/auth/session';
import { verifyFirebaseToken } from '$lib/server/auth/firebase';
import { SESSION_EXPIRY_SECONDS } from '$lib/server/auth/types';
import { AuthError } from '$lib/server/auth/types';

const REFRESH_THRESHOLD = 2 * 24 * 60 * 60;

// Rate limiter configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = {
	admin: 60, // 60 requests per minute for admin endpoints
	api: 100, // 100 requests per minute for API endpoints
	public: 200, // 200 requests per minute for public pages
	auth: 10 // 10 attempts per minute for auth endpoints
};

// In-memory rate limit store (for single-instance dev)
// Production: Use Cloudflare KV or Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(
	key: string,
	maxRequests: number
): { success: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const existing = rateLimitStore.get(key);

	if (!existing || now > existing.resetAt) {
		rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return { success: true, remaining: maxRequests - 1, resetAt: now + RATE_LIMIT_WINDOW };
	}

	if (existing.count >= maxRequests) {
		return { success: false, remaining: 0, resetAt: existing.resetAt };
	}

	existing.count++;
	return { success: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

function getRateLimitKey(event: RequestEvent): { key: string; max: number } {
	const path = event.url.pathname;
	const ip = event.request.headers.get('cf-connecting-ip') || 'unknown';

	// Auth endpoints
	if (path.includes('/sign-in') || path.includes('/sign-up') || path.includes('/forgot-password')) {
		return { key: `auth:${ip}`, max: RATE_LIMIT_MAX.auth };
	}

	// Admin endpoints
	if (path.startsWith('/admin')) {
		const userId = event.cookies.get('session_id') || ip;
		return { key: `admin:${userId}`, max: RATE_LIMIT_MAX.admin };
	}

	// API endpoints
	if (path.startsWith('/api')) {
		return { key: `api:${ip}`, max: RATE_LIMIT_MAX.api };
	}

	// Public pages
	return { key: `public:${ip}`, max: RATE_LIMIT_MAX.public };
}

export const handle: Handle = async ({ event, resolve }) => {
	// Rate limiting (except static assets)
	if (!event.url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
		const { key, max } = getRateLimitKey(event);
		const { success, remaining, resetAt } = rateLimit(key, max);

		event.request.headers.set('X-RateLimit-Limit', max.toString());
		event.request.headers.set('X-RateLimit-Remaining', remaining.toString());
		event.request.headers.set('X-RateLimit-Reset', Math.ceil(resetAt / 1000).toString());

		if (!success) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
					'Content-Type': 'text/plain'
				}
			});
		}
	}

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

	const reserved = [
		'www',
		'app',
		'api',
		'admin',
		'super-admin',
		'sign-in',
		'sign-up',
		'test-css',
		'dashboard'
	];
	if (reserved.includes(subdomain)) {
		subdomain = '';
	}

	// Try path-based resolution if no subdomain
	if (!subdomain) {
		const pathParts = event.url.pathname.split('/');
		if (pathParts.length > 1 && pathParts[1] && !reserved.includes(pathParts[1])) {
			// Basic check: if it looks like a slug (not a static asset or common route)
			const possibleSlug = pathParts[1];
			const staticAssets = ['favicon.ico', 'robots.txt', 'images', 'fonts', 'api'];
			if (!staticAssets.includes(possibleSlug)) {
				subdomain = possibleSlug;
			}
		}
	}

	if (subdomain) {
		// Avoid Cloudflare platform emulation in local dev to prevent EPERM writes
		const platformForResolution =
			process.env.NODE_ENV === 'development' ? undefined : event.platform;
		const tenant = await resolveTenant(subdomain, platformForResolution);
		if (tenant) {
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

			// Check if impersonating
			const impersonatorSessionId = event.cookies.get('impersonator_session_id');
			event.locals.isImpersonating = !!impersonatorSessionId;

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
