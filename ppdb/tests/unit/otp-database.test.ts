import { describe, it, expect, beforeEach } from 'vitest';
import { sendOTP, verifyOTP, generateOTP } from '$lib/server/whatsapp/providers/waha';
import { db } from '$lib/server/db';
import { otpCodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { AuthError } from '$lib/server/auth/types';

describe('OTP Database Storage', () => {
	beforeEach(async () => {
		await db.delete(otpCodes);
	});

	describe('generateOTP', () => {
		it('generates a 6-digit numeric code', () => {
			const otp = generateOTP();
			expect(otp).toMatch(/^\d{6}$/);
			expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
			expect(parseInt(otp)).toBeLessThanOrEqual(999999);
		});

		it('generates unique codes', () => {
			const otp1 = generateOTP();
			const otp2 = generateOTP();
			expect(otp1).not.toBe(otp2);
		});
	});

	describe('sendOTP', () => {
		it('stores OTP in database', async () => {
			const phoneNumber = '+6281234567890';
			const result = await sendOTP(phoneNumber);

			expect(result).not.toBeNull();
			expect(result?.success).toBe(true);
			expect(result?.sessionId).toBeDefined();

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, result!.sessionId!))
				.limit(1);

			expect(storedOTP.length).toBe(1);
			expect(storedOTP[0].phoneNumber).toBe(phoneNumber);
			expect(storedOTP[0].code).toMatch(/^\d{6}$/);
			expect(storedOTP[0].expiresAt).toBeInstanceOf(Date);
		});

		it('sets OTP expiry to 5 minutes', async () => {
			const phoneNumber = '+6281234567890';
			const now = Date.now();
			const result = await sendOTP(phoneNumber);

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, result!.sessionId!))
				.limit(1);

			const expiryTime = storedOTP[0].expiresAt.getTime();
			const expectedExpiry = now + 5 * 60 * 1000;
			expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(1000);
		});

		it('throws error for empty phone number', async () => {
			await expect(sendOTP('')).rejects.toThrow(AuthError);
		});

		it('throws error for invalid phone number format', async () => {
			await expect(sendOTP('invalid-phone')).rejects.toThrow(AuthError);
		});

		it('supports Indonesian phone formats', async () => {
			const formats = [
				'+6281234567890',
				'6281234567890',
				'081234567890',
				'+628123456789',
				'08123456789'
			];

			for (const format of formats) {
				const result = await sendOTP(format);
				expect(result).not.toBeNull();
			}
		});
	});

	describe('verifyOTP', () => {
		it('verifies valid OTP code', async () => {
			const phoneNumber = '+6281234567890';
			const sendResult = await sendOTP(phoneNumber);

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!))
				.limit(1);

			const verifyResult = await verifyOTP(sendResult!.sessionId!, storedOTP[0].code);

			expect(verifyResult).not.toBeNull();
			expect(verifyResult?.valid).toBe(true);
			expect(verifyResult?.phoneNumber).toBe(phoneNumber);
		});

		it('rejects invalid OTP code', async () => {
			const phoneNumber = '+6281234567890';
			const sendResult = await sendOTP(phoneNumber);

			const verifyResult = await verifyOTP(sendResult!.sessionId!, '000000');

			expect(verifyResult).not.toBeNull();
			expect(verifyResult?.valid).toBe(false);
		});

		it('rejects expired OTP', async () => {
			const phoneNumber = '+6281234567890';
			const sendResult = await sendOTP(phoneNumber);

			await db
				.update(otpCodes)
				.set({ expiresAt: new Date(Date.now() - 1000) })
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!));

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!))
				.limit(1);

			const verifyResult = await verifyOTP(sendResult!.sessionId!, storedOTP[0].code);

			expect(verifyResult).not.toBeNull();
			expect(verifyResult?.valid).toBe(false);
		});

		it('throws error for empty sessionId', async () => {
			await expect(verifyOTP('', '123456')).rejects.toThrow(AuthError);
		});

		it('throws error for empty code', async () => {
			await expect(verifyOTP('some-session-id', '')).rejects.toThrow(AuthError);
		});

		it('throws error for invalid code format', async () => {
			await expect(verifyOTP('some-session-id', 'abcdef')).rejects.toThrow(AuthError);
		});

		it('deletes OTP after successful verification', async () => {
			const phoneNumber = '+6281234567890';
			const sendResult = await sendOTP(phoneNumber);

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!))
				.limit(1);

			await verifyOTP(sendResult!.sessionId!, storedOTP[0].code);

			const remainingOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!));

			expect(remainingOTP.length).toBe(0);
		});

		it('deletes expired OTP on verification', async () => {
			const phoneNumber = '+6281234567890';
			const sendResult = await sendOTP(phoneNumber);

			await db
				.update(otpCodes)
				.set({ expiresAt: new Date(Date.now() - 1000) })
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!));

			const storedOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!))
				.limit(1);

			await verifyOTP(sendResult!.sessionId!, storedOTP[0].code);

			const remainingOTP = await db
				.select()
				.from(otpCodes)
				.where(eq(otpCodes.sessionId, sendResult!.sessionId!));

			expect(remainingOTP.length).toBe(0);
		});
	});
});
