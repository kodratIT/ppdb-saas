import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tenants, schoolProfiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		throw error(404, 'School not found');
	}

	const profile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, tenant.id)
	});

	return {
		tenant,
		profile
	};
};
