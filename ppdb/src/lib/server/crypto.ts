import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const ALGORITHM = 'AES-GCM';

// Helper to get crypto key from env
async function getKey(): Promise<CryptoKey> {
	const secret = env.ENCRYPTION_SECRET;
	if (!secret) {
		throw error(500, 'ENCRYPTION_SECRET is not set');
	}

	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes

	return await crypto.subtle.importKey('raw', keyData, { name: ALGORITHM }, false, [
		'encrypt',
		'decrypt'
	]);
}

export async function encrypt(text: string): Promise<string> {
	const key = await getKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoder = new TextEncoder();
	const data = encoder.encode(text);

	const encrypted = await crypto.subtle.encrypt(
		{
			name: ALGORITHM,
			iv
		},
		key,
		data
	);

	// Combine IV + Encrypted Data
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(encrypted), iv.length);

	// Convert to base64
	return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedText: string): Promise<string> {
	try {
		const key = await getKey();
		const combined = new Uint8Array(
			atob(encryptedText)
				.split('')
				.map((c) => c.charCodeAt(0))
		);

		const iv = combined.slice(0, 12);
		const data = combined.slice(12);

		const decrypted = await crypto.subtle.decrypt(
			{
				name: ALGORITHM,
				iv
			},
			key,
			data
		);

		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	} catch (e) {
		console.error('Decryption failed', e);
		throw error(500, 'Decryption failed');
	}
}
