import type { Handle } from '@sveltejs/kit';
import { resolveTenant } from '$lib/server/tenant';

export const handle: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') || '';
	let subdomain = '';

	// Localhost handling: school.localhost:5173
	if (host.includes('localhost') || host.includes('127.0.0.1')) {
		const parts = host.split('.');
		if (parts.length > 1 && parts[0] !== 'localhost') {
			subdomain = parts[0];
		}
	} else {
		// Production handling: school.ppdb.id
		const parts = host.split('.');
		// Assuming 3 parts for subdomain: school.ppdb.id
		// If 2 parts: ppdb.id (root)
		if (parts.length > 2) {
			subdomain = parts[0];
		}
	}

	// Reserved subdomains
	const reserved = ['www', 'app', 'api', 'admin', 'super-admin'];
	if (reserved.includes(subdomain)) {
		subdomain = '';
	}

	if (subdomain) {
		const tenant = await resolveTenant(subdomain, event.platform);
		if (tenant) {
			event.locals.tenantId = tenant.id;
			event.locals.tenant = tenant;
		} else {
			// Subdomain exists but tenant not found
			return new Response('School not found', { status: 404 });
		}
	}

	return resolve(event);
};
