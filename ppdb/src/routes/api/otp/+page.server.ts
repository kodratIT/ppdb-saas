import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { sendOTP, verifyOTP } from '$lib/server/whatsapp/providers/waha';
import { createSession } from '$lib/server/auth/session';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import { AuthError } from '$lib/server/auth/types';

interface RateLimitEntry {
	count: number;
	windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(phoneNumber: string): boolean {
	const now = Date.now();
	const windowStart = now - 5 * 60 * 1000;
	const entry = rateLimitStore.get(phoneNumber);

	if (!entry || entry.windowStart < windowStart) {
		rateLimitStore.set(phoneNumber, { count: 1, windowStart: now });
		return true;
	}

	if (entry.count >= 5) {
		return false;
	}

	entry.count += 1;
	return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _cleanupRateLimit() {
	const now = Date.now();
	const windowStart = now - 5 * 60 * 1000;

	for (const [phoneNumber, entry] of rateLimitStore.entries()) {
		if (entry.windowStart < windowStart) {
			rateLimitStore.delete(phoneNumber);
		}
	}
}

export const actions: Actions = {
	sendOTP: async ({ request }) => {
		const data = await request.formData();
		const phoneNumber = data.get('phoneNumber');

		if (!phoneNumber || typeof phoneNumber !== 'string') {
			return fail(400, { error: 'Phone number is required' });
		}

		try {
			if (!checkRateLimit(phoneNumber)) {
				return fail(429, { error: 'Too many OTP requests. Please wait 5 minutes.' });
			}

			const result = await sendOTP(phoneNumber);

			return { success: true, sessionId: result.sessionId };
		} catch (error) {
			if (error instanceof AuthError) {
				return fail(error.statusCode, { error: error.message });
			}

			console.error('Send OTP error:', error);
			return fail(500, { error: 'Failed to send OTP' });
		}
	},

	verifyOTP: async ({ request, cookies, locals }) => {
		const data = await request.formData();
		const sessionId = data.get('sessionId');
		const code = data.get('code');

		if (!sessionId || typeof sessionId !== 'string') {
			return fail(400, { error: 'Session ID is required' });
		}

		if (!code || typeof code !== 'string') {
			return fail(400, { error: 'OTP code is required' });
		}

		try {
			const result = await verifyOTP(sessionId, code);

			if (!result.valid) {
				return fail(401, { error: 'Invalid or expired OTP' });
			}

			if (!locals.tenantId) {
				return fail(403, { error: 'Tenant context not found' });
			}

			if (!result.phoneNumber) {
				return fail(500, { error: 'Failed to get phone number from OTP' });
			}

			const phoneNumber = result.phoneNumber;
			const existingUsers = await db
				.select()
				.from(users)
				.where(eq(users.email, `${phoneNumber}@ppdb.local`))
				.limit(1);

			let userId: string;

			if (existingUsers.length === 0) {
				const newUser = await db
					.insert(users)
					.values({
						email: `${phoneNumber}@ppdb.local`,
						tenantId: locals.tenantId,
						name: phoneNumber,
						role: 'parent',
						status: 'active'
					})
					.returning();

				if (!newUser || newUser.length === 0) {
					return fail(500, { error: 'Failed to create user' });
				}

				userId = newUser[0].id;
			} else {
				userId = existingUsers[0].id;
			}

			const session = await createSession({
				userId,
				tenantId: locals.tenantId,
				authType: 'waha',
				authIdentifier: result.phoneNumber
			});

			cookies.set('session_id', session.id, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
				maxAge: session.expiresAt.getTime() - Date.now()
			});

			return { success: true };
		} catch (error) {
			if (error instanceof AuthError) {
				return fail(error.statusCode, { error: error.message });
			}

			console.error('Verify OTP error:', error);
			return fail(500, { error: 'Failed to verify OTP' });
		}
	}
};
