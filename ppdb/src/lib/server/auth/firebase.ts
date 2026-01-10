import admin from 'firebase-admin';
import { env } from '$env/dynamic/private';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { AuthError, type FirebaseCustomClaims, type FirebaseUser } from './types';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
	if (firebaseApp) {
		return firebaseApp;
	}

	if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
		throw new AuthError('Firebase configuration missing', 'FIREBASE_CONFIG_ERROR', 500);
	}

	firebaseApp = admin.initializeApp({
		credential: admin.credential.cert({
			projectId: env.FIREBASE_PROJECT_ID,
			privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			clientEmail: env.FIREBASE_CLIENT_EMAIL
		})
	});

	return firebaseApp;
}

export async function verifyFirebaseToken(token: string): Promise<FirebaseUser> {
	if (!token || token.trim() === '') {
		throw new AuthError('Token is required', 'INVALID_TOKEN', 401);
	}

	try {
		const app = getFirebaseApp();
		const decoded = await admin.auth(app).verifyIdToken(token);

		const customClaims = decoded.claims as unknown as FirebaseCustomClaims;

		return {
			uid: decoded.uid,
			email: decoded.email || '',
			role: customClaims?.role,
			tenantId: customClaims?.tenantId
		};
	} catch (error: any) {
		console.error('Firebase token verification failed:', error);
		if (error.code === 'auth/id-token-expired') {
			throw new AuthError('Token has expired', 'TOKEN_EXPIRED', 401);
		}
		if (error.code === 'auth/invalid-id-token') {
			throw new AuthError('Invalid token', 'INVALID_TOKEN', 401);
		}
		throw new AuthError('Authentication failed', 'AUTH_FAILED', 401);
	}
}

export async function createFirebaseUser(email: string, password: string): Promise<FirebaseUser> {
	if (!email || !password) {
		throw new AuthError('Email and password are required', 'INVALID_INPUT', 400);
	}

	try {
		const app = getFirebaseApp();
		const userRecord = await admin.auth(app).createUser({
			email,
			password
		});

		return {
			uid: userRecord.uid,
			email: userRecord.email || email
		};
	} catch (error: any) {
		console.error('Firebase user creation failed:', error);
		if (error.code === 'auth/email-already-exists') {
			throw new AuthError('Email already exists', 'EMAIL_EXISTS', 409);
		}
		throw new AuthError('Failed to create user', 'USER_CREATION_FAILED', 500);
	}
}

export async function authenticateFirebaseUser(
	email: string,
	password: string
): Promise<FirebaseUser> {
	if (!email || !password) {
		throw new AuthError('Email and password are required', 'INVALID_INPUT', 400);
	}

	try {
		const app = getFirebaseApp();
		const userRecord = await admin.auth(app).getUserByEmail(email);

		return {
			uid: userRecord.uid,
			email: userRecord.email || email
		};
	} catch (error: any) {
		console.error('Firebase authentication failed:', error);
		if (error.code === 'auth/user-not-found') {
			throw new AuthError('Authentication failed', 'AUTH_FAILED', 401);
		}
		throw new AuthError('Authentication failed', 'AUTH_FAILED', 401);
	}
}
