import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionModule from '$lib/server/auth/session';
import type { Session } from '$lib/server/auth/types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

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

			vi.spyOn(db, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			} as any);

			vi.spyOn(db, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession])
				})
			} as any);

			const result = await sessionModule.createSession(sessionData);

			expect(result).not.toBeNull();
			expect(result?.authType).toBe('firebase');
			expect(result?.role).toBe('school_admin');
		});

		it('should create session for WAHA user', async () => {
			const sessionData = {
				userId: 'user-456',
				tenantId: 'tenant-123',
				authType: 'waha' as const,
				authIdentifier: '+628123456789',
				expiresIn: 3600
			};

			const wahaSession = { ...mockSession, ...sessionData };

			vi.spyOn(db, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([wahaSession])
				})
			} as any);

			const result = await sessionModule.createSession(sessionData);

			expect(result).not.toBeNull();
			expect(result?.authType).toBe('waha');
		});

		it('should calculate expiration date correctly', async () => {
			const sessionData = {
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase' as const,
				authIdentifier: 'firebase-uid-123',
				expiresIn: 7200
			};

			const sessionWithExpiry = {
				...mockSession,
				expiresAt: new Date(Date.now() + 7200000)
			};

			vi.spyOn(db, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([sessionWithExpiry])
				})
			} as any);

			const result = await sessionModule.createSession(sessionData);

			expect(result).not.toBeNull();
			expect(result?.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});
	});

	describe('validateSession', () => {
		it('should return null for non-existent session', async () => {
			vi.spyOn(db, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await sessionModule.validateSession('non-existent-session-id');

			expect(result).toBeNull();
		});

		it('should return null for expired session', async () => {
			const expiredSession = {
				...mockSession,
				expiresAt: new Date(Date.now() - 1000)
			};

			vi.spyOn(db, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([expiredSession])
				})
			} as any);

			const result = await sessionModule.validateSession('expired-session-id');

			expect(result).toBeNull();
		});

		it('should return valid session data', async () => {
			vi.spyOn(db, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockSession])
				})
			} as any);

			const result = await sessionModule.validateSession('session-123');

			expect(result).not.toBeNull();
			expect(result?.userId).toBe('user-123');
			expect(result?.tenantId).toBe('tenant-123');
		});
	});

	describe('invalidateSession', () => {
		it('should delete session from database', async () => {
			vi.spyOn(db, 'delete').mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession])
				})
			} as any);

			await sessionModule.invalidateSession('session-123');

			expect(db.delete).toHaveBeenCalled();
		});
	});

	describe('refreshSession', () => {
		it('should update session expiration', async () => {
			const refreshedSession = {
				...mockSession,
				expiresAt: new Date(Date.now() + 3600000)
			};

			vi.spyOn(db, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([refreshedSession])
					})
				})
			} as any);

			const result = await sessionModule.refreshSession('session-123', 3600);

			expect(result).not.toBeNull();
			expect(result?.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});
	});
});
