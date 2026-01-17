import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getSchoolProfileByTenantId } from '$lib/server/domain/school-profile';
import { tenants } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		return {
			error: 'School not found',
			tenantSlug: params.tenant,
			school: null,
			admissionPaths: []
		};
	}

	const school = await getSchoolProfileByTenantId(db, tenant.id);

	return {
		tenantSlug: params.tenant,
		school,
		admissionPaths: []
	};
};
