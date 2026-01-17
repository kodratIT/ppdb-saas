import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '$env/dynamic/private';

// Ensure we have a master key. In prod this should be a long random string.
// For dev fallback, we use a fixed 32-char string if env is missing (NOT FOR PROD).
const ENCRYPTION_KEY = env.ENCRYPTION_KEY || 'default-dev-key-must-be-32-bytes!';
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
	if (!text) return text;

	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);

	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	const authTag = cipher.getAuthTag();

	// Format: IV:AuthTag:EncryptedData (all hex encoded)
	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
	if (!text) return text;

	const parts = text.split(':');
	if (parts.length !== 3) {
		// Not encrypted or invalid format, return as is (for migration compatibility)
		return text;
	}

	try {
		const iv = Buffer.from(parts[0], 'hex');
		const authTag = Buffer.from(parts[1], 'hex');
		const encryptedText = Buffer.from(parts[2], 'hex');

		const decipher = createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return decrypted.toString();
	} catch (error) {
		console.error('Decryption failed:', error);
		return 'Decryption Error'; // Or throw
	}
}
