import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export interface TenantConfig {
	id: string;
	name: string;
	slug: string;
	status: 'active' | 'inactive';
}

export async function resolveTenant(
	subdomain: string,
	platform: App.Platform | undefined
): Promise<TenantConfig | null> {
	if (!subdomain) return null;

	const cacheKey = `subdomain:${subdomain}`;

	// 1. Try KV
	if (platform?.env?.TENANTS_KV) {
		const cached = await platform.env.TENANTS_KV.get(cacheKey, 'json');
		if (cached) {
			return cached as TenantConfig;
		}
	}

	// 2. Try DB
	try {
		const tenant = await db.query.tenants.findFirst({
			where: eq(tenants.slug, subdomain)
		});

		if (tenant) {
			const config: TenantConfig = {
				id: tenant.id,
				name: tenant.name,
				slug: tenant.slug,
				status: tenant.status
			};

			// 3. Cache in KV
			if (platform?.env?.TENANTS_KV) {
				await platform.env.TENANTS_KV.put(cacheKey, JSON.stringify(config), {
					expirationTtl: 3600 // 1 hour
				});
			}

			return config;
		}
	} catch (e) {
		console.error('Tenant resolution error:', e);
	}

	return null;
}
