import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionModule from '$lib/server/auth/session';
import type { Session } from '$lib/server/auth/types';
import { db } from '$lib/server/db';

describe('Session Management', () => {
	const mockSession: Session = {
		id: 'session-123',
		userId: 'user-123',
		tenantId: 'tenant-123',
		authType: 'firebase',
		authIdentifier: 'firebase-uid-123',
		role: 'school_admin',
		expiresAt: new Date(Date.now() + 3600000),
		createdAt: new Date()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createSession', () => {
		it('should create session for Firebase user', async () => {
			const sessionData = {
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase' as const,
				authIdentifier: 'firebase-uid-123',
				expiresIn: 3600
			};

			const mockUser = { id: 'user-123', email: 'test@example.com', role: 'school_admin' };

			// Mock select chain for users
			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			});
			// @ts-expect-error - Mocking db.select for testing purposes
			db.select = selectMock;

			// Mock insert chain
			const insertMock = vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession])
				})
			});
			// @ts-expect-error - Mocking db.insert for testing purposes
			db.insert = insertMock;

			await sessionModule.createSession(sessionData);

			expect(db.insert).toHaveBeenCalled();
			expect(db.select).toHaveBeenCalled();
		});
	});
});
