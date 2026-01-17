import { db } from '$lib/server/db';
import { tenants, schoolProfiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get global branding settings from the central 'admin' tenant.
 */
export async function getGlobalBranding() {
	const centralTenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, 'admin')
	});

	if (!centralTenant) return null;

	const profile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, centralTenant.id)
	});

	return {
		brandName: profile?.name || 'PPDB-SAAS',
		logoUrl: profile?.logoUrl || null,
		primaryColor: profile?.primaryColor || '#002C5F',
		secondaryColor: profile?.secondaryColor || '#FFFFFF'
	};
}
