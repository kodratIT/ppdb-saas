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

export async function sendWhatsappMessage(phoneNumber: string, message: string): Promise<boolean> {
	// For testing purpose, we need to check if we are in test environment and using mocks
	let wahaBaseUrl = env.WAHA_BASE_URL;
	let wahaSession = env.WAHA_SESSION;

	if (process.env.NODE_ENV === 'test') {
		wahaBaseUrl = process.env.WAHA_BASE_URL || wahaBaseUrl;
		wahaSession = process.env.WAHA_SESSION || wahaSession;
        
        if (process.env.WAHA_BASE_URL === '') wahaBaseUrl = '';
        if (process.env.WAHA_SESSION === '') wahaSession = '';
	}

	if (!wahaBaseUrl || !wahaSession) {
		console.warn('WAHA configuration missing, skipping WhatsApp message');
		return false;
	}

	// Format phone number: ensure it ends with @c.us and has country code
	// Assuming input is already cleaned or we clean it here.
	// The existing sendOTP had regex check: /^(\+62|62|0)[0-9]{9,12}$/
	let chatId = phoneNumber;
	if (!chatId.includes('@c.us')) {
		// Basic cleanup if needed, but assuming caller provides valid phone for now or we rely on existing validation
		// For WAHA, usually needs country code. 
		if (chatId.startsWith('0')) {
			chatId = '62' + chatId.slice(1);
		}
		if (chatId.startsWith('+')) {
			chatId = chatId.slice(1);
		}
		chatId = `${chatId}@c.us`;
	}

	try {
		const response = await fetch(`${wahaBaseUrl}/api/sendText`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				session: wahaSession,
				chatId: chatId,
				text: message
			})
		});

		if (!response.ok) {
			console.error('WAHA API error:', response.statusText);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Failed to send message via WAHA:', error);
		return false;
	}
}

export async function sendOTP(phoneNumber: string): Promise<WAHAOTPResponse> {
	if (!phoneNumber || phoneNumber.trim() === '') {
		throw new AuthError('Phone number is required', 'INVALID_PHONE_NUMBER', 400);
	}

	const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
	if (!phoneRegex.test(phoneNumber)) {
		throw new AuthError('Invalid phone number format', 'INVALID_PHONE_NUMBER', 400);
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

	const message = `Kode OTP Anda adalah: ${code}. Berlaku 5 menit. Jangan bagikan kode ini kepada siapapun.`;
	const sent = await sendWhatsappMessage(phoneNumber, message);

	if (!sent) {
		throw new AuthError('Failed to send OTP', 'OTP_SEND_FAILED', 500);
	}

	return {
		success: true,
		message: 'OTP sent successfully',
		sessionId
	};
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
