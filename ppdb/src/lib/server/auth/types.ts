export class AuthError extends Error {
	constructor(
		message: string,
		public code: string = 'AUTH_ERROR',
		public statusCode: number = 400
	) {
		super(message);
		this.name = 'AuthError';
	}
}

export interface Session {
	id: string;
	userId: string;
	tenantId: string;
	authType: 'firebase' | 'waha';
	authIdentifier: string;
	role?: string;
	expiresAt: Date;
	createdAt: Date;
}

export interface FirebaseUser {
	uid: string;
	email: string;
	role?: string;
	tenantId?: string;
}

export interface FirebaseCustomClaims {
	role?: 'super_admin' | 'school_admin' | 'verifier' | 'treasurer' | 'parent';
	tenantId?: string;
}

export interface WAHAOTPRequest {
	phoneNumber: string;
}

export interface WAHAOTPResponse {
	success: boolean;
	message?: string;
	sessionId?: string;
}

export interface WAHASendTextPayload {
	session: string;
	chatId: string;
	text: string;
}

export interface WhatsAppProvider {
	sendOTP(phoneNumber: string): Promise<WAHAOTPResponse | null>;
	verifyOTP(
		sessionId: string,
		code: string
	): Promise<{ valid: boolean; phoneNumber?: string } | null>;
}

export interface AuthenticatedUser {
	id: string;
	email: string;
	tenantId: string;
	role: string;
}

export const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
