import type { PageServerLoad } from './$types';
import { getSchoolProfileByTenantId } from '$lib/server/domain/school-profile';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenantId;

	if (!tenantId) {
		return {
			profile: null
		};
	}

	const profile = await getSchoolProfileByTenantId(db, tenantId);

	return {
		profile
	};
};
