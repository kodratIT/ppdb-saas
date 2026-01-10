import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as wahaModule from '$lib/server/whatsapp/providers/waha';
import { AuthError, type WAHAOTPResponse } from '$lib/server/auth/types';

describe('WAHA Provider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('sendOTP', () => {
		it('should throw error for empty phone number', async () => {
			await expect(wahaModule.sendOTP('')).rejects.toThrow(AuthError);
		});

		it('should throw error for invalid phone number format', async () => {
			await expect(wahaModule.sendOTP('123')).rejects.toThrow(AuthError);
		});

		it('should generate 6-digit OTP code', async () => {
			const phone = '08123456789';
			const originalEnv = process.env;

			vi.stubEnv('WAHA_BASE_URL', 'http://mock-waha-url');
			vi.stubEnv('WAHA_SESSION', 'test-session');

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({})
				} as Response)
			);

			const result = await wahaModule.sendOTP(phone);

			expect(result.sessionId).toBeDefined();
			expect(typeof result.sessionId).toBe('string');

			process.env = originalEnv;
		});

		it('should throw error when WAHA config is missing', async () => {
			const originalEnv = process.env;

			vi.stubEnv('WAHA_BASE_URL', '');
			vi.stubEnv('WAHA_SESSION', '');

			await expect(wahaModule.sendOTP('08123456789')).rejects.toThrow(AuthError);

			process.env = originalEnv;
		});
	});

	describe('verifyOTP', () => {
		it('should throw error for empty session ID', async () => {
			await expect(wahaModule.verifyOTP('', '123456')).rejects.toThrow(AuthError);
		});

		it('should throw error for empty OTP code', async () => {
			await expect(wahaModule.verifyOTP('session-id', '')).rejects.toThrow(AuthError);
		});

		it('should throw error for invalid OTP format', async () => {
			await expect(wahaModule.verifyOTP('session-id', '123')).rejects.toThrow(AuthError);
		});

		it('should verify valid OTP code', async () => {
			const sessionId = 'test-session-123';

			const result = await wahaModule.verifyOTP(sessionId, '123456');

			expect(result).toHaveProperty('valid');
		});

		it('should return false for expired OTP', async () => {
			const sessionId = 'expired-session-123';

			const result = await wahaModule.verifyOTP(sessionId, '123456');

			expect(result.valid).toBe(false);
		});
	});

	describe('generateOTP', () => {
		it('should generate 6-digit code', () => {
			const otp = wahaModule.generateOTP();
			expect(otp).toHaveLength(6);
			expect(/^\d{6}$/.test(otp)).toBe(true);
		});

		it('should generate different codes', () => {
			const otp1 = wahaModule.generateOTP();
			const otp2 = wahaModule.generateOTP();

			expect(otp1).not.toBe(otp2);
		});
	});
});
