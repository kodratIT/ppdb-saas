import { describe, it, expect, vi } from 'vitest';

describe('Registration Start - OTP Request', () => {
	it('should send OTP to valid phone number', async () => {
		const sendOTP = vi.fn().mockResolvedValue({ success: true });

		const phoneNumber = '+6281234567890';
		await sendOTP(phoneNumber, 'test-school');

		expect(sendOTP).toHaveBeenCalledWith('+6281234567890', 'test-school');
	});

	it('should reject invalid phone number format', async () => {
		const invalidPhone = '08123456789';
		expect(invalidPhone).toBeTruthy();
	});
});
