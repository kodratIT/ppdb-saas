import { ENCRYPTION_KEY } from '$env/static/private';
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length is 12 bytes

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: iv:authTag:encryptedText (all in hex)
 */
export function encrypt(text: string): string {
	if (!ENCRYPTION_KEY) {
		throw new Error('ENCRYPTION_KEY is not defined in environment variables');
	}

	// We use scrypt to derive a 32-byte key from the ENCRYPTION_KEY
	// In production, the ENCRYPTION_KEY itself should ideally be a random 32-byte hex string
	const key = crypto.scryptSync(ENCRYPTION_KEY, 'ppdb-salt', 32);
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag().toString('hex');

	return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a ciphertext encrypted with AES-256-GCM.
 * Expects format: iv:authTag:encryptedText (all in hex)
 */
export function decrypt(ciphertext: string): string {
	if (!ENCRYPTION_KEY) {
		throw new Error('ENCRYPTION_KEY is not defined in environment variables');
	}

	const parts = ciphertext.split(':');
	if (parts.length !== 3) {
		throw new Error('Invalid ciphertext format');
	}

	const [ivHex, authTagHex, encryptedText] = parts;
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const key = crypto.scryptSync(ENCRYPTION_KEY, 'ppdb-salt', 32);

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
