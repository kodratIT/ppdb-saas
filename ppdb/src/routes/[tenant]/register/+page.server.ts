import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getSchoolProfileByTenantId } from '$lib/server/domain/school-profile';
import { tenants, admissionPaths } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		throw error(404, 'School not found');
	}

	const [school, paths] = await Promise.all([
		getSchoolProfileByTenantId(db, tenant.id),
		db.query.admissionPaths.findMany({
			where: and(eq(admissionPaths.tenantId, tenant.id), eq(admissionPaths.status, 'open'))
		})
	]);

	if (!school) {
		throw error(404, 'School profile not found');
	}

	return {
		tenantSlug: params.tenant,
		school,
		admissionPaths: paths
	};
};
