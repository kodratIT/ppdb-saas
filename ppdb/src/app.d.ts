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
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				TENANTS_KV: KVNamespace;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
