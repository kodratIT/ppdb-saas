import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSession } from '$lib/server/auth/session';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { logImpersonationStart } from '$lib/server/auth/impersonation';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, locals, cookies, request }) => {
	// 1. Verify Super Admin Access
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const { tenantId } = params;

	// 2. Find a valid user to impersonate in the target tenant
	// Ideally, we want a 'school_admin'
	const targetUsers = await db
		.select()
		.from(users)
		.where(and(eq(users.tenantId, tenantId), eq(users.role, 'school_admin')))
		.limit(1);

	let targetUser = targetUsers[0];

	// Fallback: If no school_admin, grab any user (this is edge case)
	if (!targetUser) {
		const anyUser = await db
			.select()
			.from(users)
			.where(eq(users.tenantId, tenantId))
			.limit(1);
		targetUser = anyUser[0];
	}

	if (!targetUser) {
		// If tenant has NO users at all (freshly created but no admin yet)
		// We can't really "login" as anyone.
		return new Response(JSON.stringify({ error: 'No users found in this tenant' }), {
			status: 404
		});
	}

	// 3. Create a new session for the target user
	// We use 'waha' as authType just as a placeholder for internal auth, 
	// or we can reuse 'firebase' if that's what your system expects.
	// Important: We should store the original admin session ID in a cookie to allow "Stop Impersonating"
	const newSession = await createSession({
		userId: targetUser.id,
		tenantId: tenantId,
		authType: 'waha', // or 'firebase', depends on your session validation logic
		authIdentifier: `impersonate:${auth.userId}`, // Audit trail: who impersonated
		role: targetUser.role
	});

	// 4. Set the new session cookie
	cookies.set('session_id', newSession.id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 // 1 hour impersonation limit
	});

	// 5. Store original session to allow return
	// We store the ORIGINAL session ID in a separate cookie
	cookies.set('impersonator_session_id', auth.session.id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60
	});

	// 6. Log the impersonation start
	const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
	const userAgent = request.headers.get('user-agent') || 'unknown';
	await logImpersonationStart(auth.userId, targetUser.id, tenantId, auth.session.id, ipAddress, userAgent);

	// 7. Redirect to the tenant's dashboard
	throw redirect(303, '/admin/dashboard');
};
