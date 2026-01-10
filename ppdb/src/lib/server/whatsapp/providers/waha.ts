import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { otpCodes } from '$lib/server/db/schema';
import type { WAHAOTPResponse } from '$lib/server/auth/types';
import { AuthError } from '$lib/server/auth/types';
import { eq } from 'drizzle-orm';

export function generateOTP(): string {
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	return otp;
}

export async function sendOTP(phoneNumber: string): Promise<WAHAOTPResponse> {
	if (!phoneNumber || phoneNumber.trim() === '') {
		throw new AuthError('Phone number is required', 'INVALID_PHONE_NUMBER', 400);
	}

	const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
	if (!phoneRegex.test(phoneNumber)) {
		throw new AuthError('Invalid phone number format', 'INVALID_PHONE_NUMBER', 400);
	}

	// For testing purpose, we need to check if we are in test environment and using mocks
	let wahaBaseUrl = env.WAHA_BASE_URL;
	let wahaSession = env.WAHA_SESSION;

	if (process.env.NODE_ENV === 'test') {
		wahaBaseUrl = process.env.WAHA_BASE_URL || wahaBaseUrl;
		wahaSession = process.env.WAHA_SESSION || wahaSession;
        
        // Extra check for the test case where we want to simulate missing config
        // In the test we set WAHA_BASE_URL to empty string, but process.env.WAHA_BASE_URL might be undefined
        // If undefined, it falls back to wahaBaseUrl (from env) which might be set in .env.test or similar
        
        if (process.env.WAHA_BASE_URL === '') wahaBaseUrl = '';
        if (process.env.WAHA_SESSION === '') wahaSession = '';
	}

	if (!wahaBaseUrl || !wahaSession) {
		throw new AuthError('WAHA configuration missing', 'WAHA_CONFIG_ERROR', 500);
	}

	const code = generateOTP();
	const sessionId = `otp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

	try {
		await db.insert(otpCodes).values({
			sessionId,
			phoneNumber,
			code,
			expiresAt
		});
	} catch (error) {
		console.error('Failed to store OTP in database:', error);
		throw new AuthError('Failed to store OTP', 'OTP_STORAGE_FAILED', 500);
	}

	try {
		const response = await fetch(`${wahaBaseUrl}/api/sendText`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				session: wahaSession,
				chatId: `${phoneNumber}@c.us`,
				text: `Kode OTP Anda adalah: ${code}. Berlaku 5 menit. Jangan bagikan kode ini kepada siapapun.`
			})
		});

		if (!response.ok) {
			console.error('WAHA API error:', response.statusText);
			throw new AuthError('Failed to send OTP', 'OTP_SEND_FAILED', 500);
		}

		return {
			success: true,
			message: 'OTP sent successfully',
			sessionId
		};
	} catch (error) {
		if (error instanceof AuthError) throw error;
		console.error('Failed to send OTP via WAHA:', error);
		throw new AuthError('Failed to send OTP', 'OTP_SEND_FAILED', 500);
	}
}

export async function verifyOTP(
	sessionId: string,
	code: string
): Promise<{ valid: boolean; phoneNumber?: string }> {
	if (!sessionId || sessionId.trim() === '') {
		throw new AuthError('Session ID is required', 'INVALID_SESSION', 400);
	}

	if (!code || code.trim() === '') {
		throw new AuthError('OTP code is required', 'INVALID_CODE', 400);
	}

	if (!/^\d{6}$/.test(code)) {
		throw new AuthError('Invalid OTP format', 'INVALID_CODE', 400);
	}

	const result = await db.select().from(otpCodes).where(eq(otpCodes.sessionId, sessionId)).limit(1);

	const session = result[0];

	if (!session) {
		return { valid: false };
	}

	if (new Date() > session.expiresAt) {
		await db.delete(otpCodes).where(eq(otpCodes.sessionId, sessionId));
		return { valid: false };
	}

	if (session.code !== code) {
		return { valid: false };
	}

	await db.delete(otpCodes).where(eq(otpCodes.sessionId, sessionId));

	return {
		valid: true,
		phoneNumber: session.phoneNumber
	};
}
