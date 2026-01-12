import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tenants, schoolProfiles, admissionPaths, applications } from '$lib/server/db/schema';
import { requireAuth } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		throw error(404, 'School not found');
	}

	// Check if user is already authenticated
	let isAuthenticated = false;
	try {
		await requireAuth(locals);
		isAuthenticated = true;
		
		// If authenticated, check if they have submitted applications
		const userApps = await db.query.applications.findMany({
			where: and(
					eq(applications.userId, locals.userId),
					eq(applications.tenantId, tenant.id)
				),
			limit: 1
		});

		// If user has apps, redirect to dashboard
		if (userApps.length > 0) {
			throw redirect(303, `/${params.tenant}/dashboard`);
		}
	} catch {
		// User not authenticated, continue to registration flow
		// Fall through
	}

	const profile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, tenant.id)
	});

	if (!profile) {
		throw error(404, 'School profile not configured');
	}

	const paths = await db.query.admissionPaths.findMany({
		where: and(eq(admissionPaths.tenantId, tenant.id), eq(admissionPaths.status, 'open'))
	});

	return {
		school: {
			name: profile.name,
			description: profile.description,
			contactEmail: profile.contactEmail,
			contactPhone: profile.contactPhone,
			logoUrl: profile.logoUrl,
			bannerUrl: profile.bannerUrl
		},
		admissionPaths: paths.map((path) => ({
			id: path.id,
			name: path.name,
			description: path.description,
			quota: path.quota
		})),
		tenantId: tenant.id,
		tenantSlug: tenant.slug,
		isAuthenticated
	};
}

	// Check if user is already authenticated
	let isAuthenticated = false;
	try {
		await requireAuth(locals);
		isAuthenticated = true;

		// If authenticated, check if they have submitted applications
		const userApps = await db.query.applications.findMany({
			where: and(eq(applications.userId, locals.userId), eq(applications.tenantId, tenant.id)),
			orderBy: [sql`applications.created_at DESC`],
			limit: 1
		});

		// If user has apps, redirect to dashboard
		if (userApps.length > 0) {
			throw redirect(303, `/${params.tenant}/dashboard`);
		}
	} catch {
		// User not authenticated, continue to registration flow
		// Fall through
	}

	const profile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, tenant.id)
	});

	if (!profile) {
		throw error(404, 'School profile not configured');
	}

	const paths = await db.query.admissionPaths.findMany({
		where: and(eq(admissionPaths.tenantId, tenant.id), eq(admissionPaths.status, 'open'))
	});

	return {
		school: {
			name: profile.name,
			description: profile.description,
			contactEmail: profile.contactEmail,
			contactPhone: profile.contactPhone,
			logoUrl: profile.logoUrl,
			bannerUrl: profile.bannerUrl
		},
		admissionPaths: paths.map((path) => ({
			id: path.id,
			name: path.name,
			description: path.description,
			quota: path.quota
		})),
		tenantId: tenant.id,
		tenantSlug: tenant.slug,
		isAuthenticated
	};
}
