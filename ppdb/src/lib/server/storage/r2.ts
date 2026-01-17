/// <reference types="@cloudflare/workers-types" />
import { error } from '@sveltejs/kit';

export class R2Storage {
	constructor(private bucket: R2Bucket) {}

	async upload(
		key: string,
		file: File | Blob | Buffer | Uint8Array,
		options?: R2PutOptions
	): Promise<void> {
		try {
			await this.bucket.put(key, file, options);
		} catch (e) {
			console.error('R2 Upload Error:', e);
			throw error(500, 'Storage upload failed');
		}
	}

	async get(key: string): Promise<R2ObjectBody | null> {
		try {
			return await this.bucket.get(key);
		} catch (e) {
			console.error('R2 Get Error:', e);
			throw error(500, 'Storage retrieval failed');
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.bucket.delete(key);
		} catch (e) {
			console.error('R2 Delete Error:', e);
			// We usually don't throw on delete failure to avoid blocking cleanup logic
		}
	}
}
