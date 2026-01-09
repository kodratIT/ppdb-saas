import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSchoolProfileByTenantId, updateSchoolProfile } from '$lib/server/domain/school-profile';
import { schoolProfileUpdateSchema } from '$lib/schema/school-profile';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenantId;

	if (!tenantId) {
		throw new Error('Unauthorized: No tenant context');
	}

	// Get existing profile or return defaults
	const profile = await getSchoolProfileByTenantId(db, tenantId);

	return {
		profile: profile || {
			name: '',
			description: null,
			contactEmail: null,
			contactPhone: null,
			logoUrl: null,
			bannerUrl: null,
			primaryColor: null,
			secondaryColor: null,
			address: null
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const tenantId = locals.tenantId;

		if (!tenantId) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const data = {
			name: formData.get('name'),
			description: formData.get('description') || null,
			contactEmail: formData.get('contactEmail') || null,
			contactPhone: formData.get('contactPhone') || null,
			logoUrl: formData.get('logoUrl') || null,
			bannerUrl: formData.get('bannerUrl') || null,
			primaryColor: formData.get('primaryColor') || null,
			secondaryColor: formData.get('secondaryColor') || null,
			address: formData.get('address') || null
		};

		// Validate with Zod
		const validation = schoolProfileUpdateSchema.safeParse(data);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten().fieldErrors;
			return fail(400, {
				error: 'Validation failed',
				errors: fieldErrors as Record<string, string[]>
			});
		}

		try {
			const updatedProfile = await updateSchoolProfile(db, tenantId, validation.data);

			return {
				success: true,
				profile: updatedProfile
			};
		} catch (error) {
			console.error('Failed to update school profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	}
};
