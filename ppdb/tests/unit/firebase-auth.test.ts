import { describe, it, expect, vi } from 'vitest';
import * as firebaseModule from '$lib/server/auth/firebase';
import { AuthError } from '$lib/server/auth/types';

describe('Firebase Authentication', () => {
	describe('verifyFirebaseToken', () => {
		it('should reject invalid Firebase ID token', async () => {
			const originalEnv = process.env;
			vi.stubEnv('FIREBASE_PROJECT_ID', 'test-project');
			vi.stubEnv('FIREBASE_PRIVATE_KEY', 'test-key');
			vi.stubEnv('FIREBASE_CLIENT_EMAIL', 'test@example.com');

			await expect(firebaseModule.verifyFirebaseToken('invalid-token')).rejects.toThrow(AuthError);

			process.env = originalEnv;
		});

		it('should reject empty token', async () => {
			await expect(firebaseModule.verifyFirebaseToken('')).rejects.toThrow(AuthError);
		});

		it('should handle Firebase verification errors gracefully', async () => {
			const originalEnv = process.env;
			vi.stubEnv('FIREBASE_PROJECT_ID', 'test-project');
			vi.stubEnv('FIREBASE_PRIVATE_KEY', 'test-key');
			vi.stubEnv('FIREBASE_CLIENT_EMAIL', 'test@example.com');

			await expect(firebaseModule.verifyFirebaseToken('malformed-token')).rejects.toThrow(
				AuthError
			);

			process.env = originalEnv;
		});
	});

	describe('createFirebaseUser', () => {
		it('should throw error for empty email', async () => {
			await expect(firebaseModule.createFirebaseUser('', 'password')).rejects.toThrow(AuthError);
		});

		it('should throw error for empty password', async () => {
			await expect(firebaseModule.createFirebaseUser('test@example.com', '')).rejects.toThrow(
				AuthError
			);
		});

		it('should throw error for empty credentials', async () => {
			await expect(firebaseModule.createFirebaseUser('', '')).rejects.toThrow(AuthError);
		});

		it('should throw error when Firebase config is missing', async () => {
			const originalEnv = process.env;

			vi.stubEnv('FIREBASE_PROJECT_ID', '');
			vi.stubEnv('FIREBASE_PRIVATE_KEY', '');
			vi.stubEnv('FIREBASE_CLIENT_EMAIL', '');

			await expect(
				firebaseModule.createFirebaseUser('test@example.com', 'password123')
			).rejects.toThrow(AuthError);

			process.env = originalEnv;
		});
	});

	describe('authenticateFirebaseUser', () => {
		it('should throw error for empty email', async () => {
			await expect(firebaseModule.authenticateFirebaseUser('', 'password')).rejects.toThrow(
				AuthError
			);
		});

		it('should throw error for empty password', async () => {
			await expect(firebaseModule.authenticateFirebaseUser('test@example.com', '')).rejects.toThrow(
				AuthError
			);
		});

		it('should throw error for empty credentials', async () => {
			await expect(firebaseModule.authenticateFirebaseUser('', '')).rejects.toThrow(AuthError);
		});

		it('should throw error for non-existent user', async () => {
			const originalEnv = process.env;
			vi.stubEnv('FIREBASE_PROJECT_ID', 'test-project');
			vi.stubEnv('FIREBASE_PRIVATE_KEY', 'test-key');
			vi.stubEnv('FIREBASE_CLIENT_EMAIL', 'test@example.com');

			await expect(
				firebaseModule.authenticateFirebaseUser('nonexistent@example.com', 'wrongpassword')
			).rejects.toThrow(AuthError);

			process.env = originalEnv;
		});
	});
});
