import { describe, it, expect, vi } from 'vitest';
import { encrypt, decrypt } from '$lib/server/utils/crypto';
import { sanitize } from '$lib/server/utils/sanitizer';

// Mock the environment variable since we're in a test environment
vi.mock('$env/static/private', () => ({
	ENCRYPTION_KEY: 'test-encryption-key-32-chars-long-!!!'
}));

describe('Security Utilities', () => {
	describe('Crypto Utility', () => {
		it('should encrypt and decrypt a string correctly', () => {
			const originalText = 'Hello World! This is a sensitive message.';
			const encrypted = encrypt(originalText);

			expect(encrypted).not.toBe(originalText);
			expect(encrypted.split(':')).toHaveLength(3);

			const decrypted = decrypt(encrypted);
			expect(decrypted).toBe(originalText);
		});

		it('should produce different ciphertexts for the same input (using different IVs)', () => {
			const text = 'Same message';
			const encrypted1 = encrypt(text);
			const encrypted2 = encrypt(text);

			expect(encrypted1).not.toBe(encrypted2);
		});

		it('should fail to decrypt with invalid ciphertext format', () => {
			expect(() => decrypt('invalid-format')).toThrow('Invalid ciphertext format');
		});
	});

	describe('Sanitizer Utility', () => {
		it('should remove script tags from HTML', () => {
			const dirtyHtml = '<p>Hello <script>alert("XSS")</script> World</p>';
			const cleanHtml = sanitize(dirtyHtml);

			expect(cleanHtml).toBe('<p>Hello  World</p>');
			expect(cleanHtml).not.toContain('<script>');
		});

		it('should remove malicious attributes', () => {
			const dirtyHtml = '<img src="x" onerror="alert(1)">';
			const cleanHtml = sanitize(dirtyHtml);

			expect(cleanHtml).toBe('<img src="x">');
			expect(cleanHtml).not.toContain('onerror');
		});

		it('should preserve safe HTML', () => {
			const safeHtml = '<div><h1>Title</h1><p>Description <strong>bold</strong></p></div>';
			const cleanHtml = sanitize(safeHtml);

			expect(cleanHtml).toBe(safeHtml);
		});
	});
});
