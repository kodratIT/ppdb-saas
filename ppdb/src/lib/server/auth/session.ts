import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import type { Session } from '$lib/server/auth/types';
import { SESSION_EXPIRY_SECONDS, AuthError } from '$lib/server/auth/types';
import { eq } from 'drizzle-orm';

export interface CreateSessionData {
	userId: string;
	tenantId: string;
	authType: 'firebase' | 'waha';
	authIdentifier: string;
	expiresIn?: number;
	role?: string;
}

export async function createSession(data: CreateSessionData): Promise<Session> {
	try {
		const expiresIn = data.expiresIn ?? SESSION_EXPIRY_SECONDS;
		const expiresAt = new Date(Date.now() + expiresIn * 1000);

		const user = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
		if (user.length === 0) {
			throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
		}

		const [newSession] = await db
			.insert(sessions)
			.values({
				userId: data.userId,
				tenantId: data.tenantId,
				authType: data.authType,
				authIdentifier: data.authIdentifier,
				expiresAt
			})
			.returning();

		return {
			...newSession,
			role: data.role || user[0].role
		};
	} catch (error) {
		if (error instanceof AuthError) throw error;
		console.error('Failed to create session:', error);
		throw new AuthError('Failed to create session', 'SESSION_CREATION_FAILED', 500);
	}
}

export async function validateSession(sessionId: string): Promise<Session> {
	try {
		const result = await db.select().from(sessions).where(eq(sessions.id, sessionId));

		const session = result[0];

		if (!session) {
			throw new AuthError('Session not found', 'SESSION_NOT_FOUND', 404);
		}

		if (new Date() > session.expiresAt) {
			await invalidateSession(sessionId);
			throw new AuthError('Session expired', 'SESSION_EXPIRED', 401);
		}

		const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
		if (user.length === 0) {
			throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
		}

		return {
			...session,
			role: user[0].role
		};
	} catch (error) {
		if (error instanceof AuthError) throw error;
		console.error('Failed to validate session:', error);
		throw new AuthError('Failed to validate session', 'SESSION_VALIDATION_FAILED', 500);
	}
}

export async function invalidateSession(sessionId: string): Promise<void> {
	try {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	} catch (error) {
		console.error('Failed to invalidate session:', error);
		throw new AuthError('Failed to invalidate session', 'SESSION_INVALIDATION_FAILED', 500);
	}
}

export async function refreshSession(sessionId: string, expiresIn?: number): Promise<Session> {
	try {
		const newExpiresIn = expiresIn ?? SESSION_EXPIRY_SECONDS;
		const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

		const [updatedSession] = await db
			.update(sessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessions.id, sessionId))
			.returning();

		if (!updatedSession) {
			throw new AuthError('Session not found', 'SESSION_NOT_FOUND', 404);
		}

		const user = await db.select().from(users).where(eq(users.id, updatedSession.userId)).limit(1);
		if (user.length === 0) {
			throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
		}

		return {
			...updatedSession,
			role: user[0].role
		};
	} catch (error) {
		if (error instanceof AuthError) throw error;
		console.error('Failed to refresh session:', error);
		throw new AuthError('Failed to refresh session', 'SESSION_REFRESH_FAILED', 500);
	}
}
