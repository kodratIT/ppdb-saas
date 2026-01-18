import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createTenant } from '$lib/server/domain/admin';
import { createFirebaseUser } from '$lib/server/auth/firebase';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { AuthError } from '$lib/server/auth/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/sign-in');
	}

	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.session || !locals.userId) {
			return fail(401, { error: true, message: 'Unauthorized' });
		}

		const data = await request.formData();
		
		// Parse formData JSON if available (from wizard)
		const formDataJson = data.get('formData');
		let parsedData: any = {};
		
		if (formDataJson && typeof formDataJson === 'string') {
			try {
				parsedData = JSON.parse(formDataJson);
			} catch (e) {
				console.error('Failed to parse formData JSON:', e);
			}
		}

		// Extract fields (prioritize individual fields, fallback to JSON)
		const name = (data.get('name') as string) || parsedData.name;
		const slug = (data.get('slug') as string) || parsedData.slug;
		const npsn = parsedData.npsn;
		const level = parsedData.level;
		const status = parsedData.status || 'active';
		
		// Location fields
		const province = parsedData.province;
		const city = parsedData.city;
		const district = parsedData.district;
		const village = parsedData.village;
		const address = parsedData.address;
		const postalCode = parsedData.postalCode;
		
		// Admin fields
		const adminName = parsedData.adminName;
		const adminEmail = (data.get('adminEmail') as string) || parsedData.email;
		const adminPassword = (data.get('adminPassword') as string) || parsedData.password;
		const whatsapp = parsedData.whatsapp;

		// Validation
		if (!name || typeof name !== 'string') {
			return fail(400, { missing: true, message: 'Name is required' });
		}
		if (!slug || typeof slug !== 'string') {
			return fail(400, { missing: true, message: 'Slug is required' });
		}
		if (!adminEmail || typeof adminEmail !== 'string') {
			return fail(400, { missing: true, message: 'Admin email is required' });
		}
		if (!adminPassword || typeof adminPassword !== 'string') {
			return fail(400, { missing: true, message: 'Admin password is required' });
		}
		if (!adminEmail.includes('@')) {
			return fail(400, { missing: true, message: 'Invalid email format' });
		}
		if (adminPassword.length < 6) {
			return fail(400, {
				missing: true,
				message: 'Password must be at least 6 characters'
			});
		}

		try {
			const actorId = locals.userId;
			
			// Create tenant with full profile data using transaction
			const newTenant = await createTenant(
				{
					name,
					slug,
					npsn,
					level,
					status: status as 'active' | 'inactive',
					province,
					city,
					district,
					village,
					address,
					postalCode
				},
				actorId
			);

			// Create Firebase user
			const firebaseUser = await createFirebaseUser(adminEmail, adminPassword);

			// Create DB user (admin)
			await db
				.insert(users)
				.values({
					email: adminEmail,
					tenantId: newTenant.id,
					name: adminName || name, // Use adminName if provided, fallback to school name
					role: 'school_admin',
					status: 'active',
					firebaseUid: firebaseUser.uid
				})
				.returning();

			return { success: true, tenantId: newTenant.id, slug: newTenant.slug };
		} catch (error) {
			console.error('Failed to create tenant or admin:', error);
			if (error instanceof AuthError) {
				return fail(error.statusCode, { error: true, message: error.message });
			}
			return fail(500, { error: true, message: 'Failed to create tenant or admin' });
		}
	}
};
