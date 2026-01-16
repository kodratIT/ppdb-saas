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

            // Mock select chain for users
            const selectMock = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockUser])
                    })
                })
            });
            // @ts-ignore
            db.select = selectMock;

            // Mock insert chain
            const insertMock = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockSession])
                })
            });
            // @ts-ignore
            db.insert = insertMock;

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
            const mockUser = { id: 'user-456', email: 'test@example.com', role: 'parent' };

             // Mock select chain for users
             const selectMock = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockUser])
                    })
                })
            });
            // @ts-ignore
            db.select = selectMock;

            // Mock insert chain
			const insertMock = vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([wahaSession])
				})
			});
            // @ts-ignore
            db.insert = insertMock;

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
            
            const mockUser = { id: 'user-123', email: 'test@example.com', role: 'school_admin' };

			const sessionWithExpiry = {
				...mockSession,
				expiresAt: new Date(Date.now() + 7200000)
			};

            // Mock select chain for users
            const selectMock = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockUser])
                    })
                })
            });
            // @ts-ignore
            db.select = selectMock;

            // Mock insert chain
			const insertMock = vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([sessionWithExpiry])
				})
			});
            // @ts-ignore
            db.insert = insertMock;

			const result = await sessionModule.createSession(sessionData);

			expect(result).not.toBeNull();
			expect(result?.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});
	});

	describe('validateSession', () => {
		it('should return null (throw error) for non-existent session', async () => {
            // Mock select chain for sessions returning empty
            const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			});
            // @ts-ignore
            db.select = selectMock;

			await expect(sessionModule.validateSession('non-existent-session-id'))
                .rejects.toThrow('Session not found');
		});

		it('should return null (throw error) for expired session', async () => {
			const expiredSession = {
				...mockSession,
				expiresAt: new Date(Date.now() - 1000)
			};

            // Mock select chain: first call returns expired session, second call (users) not reached
            const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([expiredSession])
				})
			});
            // @ts-ignore
            db.select = selectMock;
            
            // Mock delete for invalidation
            const deleteMock = vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([])
			});
            // @ts-ignore
            db.delete = deleteMock;

			await expect(sessionModule.validateSession('expired-session-id'))
                .rejects.toThrow('Session expired');
            
            expect(db.delete).toHaveBeenCalled();
		});

		it('should return valid session data', async () => {
            const mockUser = { id: 'user-123', role: 'school_admin' };

            // Mock select chain: 
            // 1. session query
            // 2. user query
            const selectMock = vi.fn()
                .mockReturnValueOnce({ // Session query
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockResolvedValue([mockSession])
                    })
                })
                .mockReturnValueOnce({ // User query
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([mockUser])
                        })
                    })
                });
            // @ts-ignore
            db.select = selectMock;

			const result = await sessionModule.validateSession('session-123');

			expect(result).not.toBeNull();
			expect(result?.userId).toBe('user-123');
			expect(result?.tenantId).toBe('tenant-123');
		});
	});

	describe('invalidateSession', () => {
		it('should delete session from database', async () => {
            const deleteMock = vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([mockSession])
			});
            // @ts-ignore
            db.delete = deleteMock;

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

            const mockUser = { id: 'user-123', role: 'school_admin' };

            // Mock update chain
            const updateMock = vi.fn().mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([refreshedSession])
					})
				})
			});
            // @ts-ignore
            db.update = updateMock;

             // Mock select chain for user query at end of refreshSession
             const selectMock = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([mockUser])
                    })
                })
            });
            // @ts-ignore
            db.select = selectMock;

			const result = await sessionModule.refreshSession('session-123', 3600);

			expect(result).not.toBeNull();
			expect(result?.expiresAt.getTime()).toBeGreaterThan(Date.now());
		});
	});
});
