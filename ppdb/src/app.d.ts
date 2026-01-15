// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			tenantId?: string;
			tenant?: {
				id: string;
				name: string;
				slug: string;
				status: 'active' | 'inactive';
			};
			session?: {
				id: string;
				userId: string;
				tenantId: string;
				authType: 'firebase' | 'waha';
				authIdentifier: string;
				expiresAt: Date;
				createdAt: Date;
				role?: string;
			};
			session?: {
				id: string;
				userId: string;
				tenantId: string;
				authType: 'firebase' | 'waha';
				authIdentifier: string;
				role: string;
				expiresAt: Date;
				createdAt: Date;
			};
			userId?: string;
			firebaseUser?: {
				uid: string;
				email?: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		interface PageParams {
			tenant?: string;
			applicationId?: string;
			admissionPathId?: string;
			documentId?: string;
			fieldId?: string;
			scoreId?: string;
		}
		interface Platform {
			env: {
				TENANTS_KV: KVNamespace;
				DOCUMENTS_BUCKET: R2Bucket;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
