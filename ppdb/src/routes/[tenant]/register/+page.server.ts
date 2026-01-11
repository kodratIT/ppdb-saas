import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tenants, schoolProfiles, admissionPaths } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		throw error(404, 'School not found');
	}

	const schoolProfile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, tenant.id)
	});

	if (!schoolProfile) {
		throw error(404, 'School profile not configured');
	}

	const openPaths = await db.query.admissionPaths.findMany({
		where: and(eq(admissionPaths.tenantId, tenant.id), eq(admissionPaths.status, 'open'))
	});

	return {
		school: {
			name: schoolProfile.name,
			description: schoolProfile.description,
			contactEmail: schoolProfile.contactEmail,
			contactPhone: schoolProfile.contactPhone,
			logoUrl: schoolProfile.logoUrl,
			bannerUrl: schoolProfile.bannerUrl
		},
		admissionPaths: openPaths.map((path) => ({
			id: path.id,
			name: path.name,
			description: path.description,
			quota: path.quota
		})),
		tenantId: tenant.id,
		tenantSlug: tenant.slug
	};
};
