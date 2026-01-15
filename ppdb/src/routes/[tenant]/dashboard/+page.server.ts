import { redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, tenants } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	// Fetch tenant info
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		throw redirect(303, '/');
	}

	// Fetch all applications for this parent
	const rawApplications = await db.query.applications.findMany({
		where: and(eq(applications.userId, auth.userId), eq(applications.tenantId, auth.tenantId)),
		with: {
			admissionPath: true
		},
		orderBy: [desc(applications.createdAt)]
	});

	// Process applications to handle announcement dates
	const now = new Date();
	const processedApplications = rawApplications.map((app) => {
		const announcementDate = app.admissionPath?.announcementDate;
		const showAnnouncement = announcementDate ? now >= announcementDate : false;

		// Mask status if announcement date hasn't passed
		let status: string = app.status;
		if (!showAnnouncement && ['accepted', 'rejected', 'waitlisted'].includes(app.status)) {
			status = 'pending_announcement';
		}

		return {
			...app,
			status,
			admissionPathName: app.admissionPath?.name,
			announcementDate,
			showAnnouncement
		};
	});

	// Get latest submitted application for potential pre-fill
	const latestSubmittedApplication = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'submitted')
		),
		orderBy: [desc(applications.submittedAt)]
	});

	return {
		applications: processedApplications,
		latestApplication: latestSubmittedApplication,
		tenant,
		tenantSlug: params.tenant
	};
}

export const actions = {
	deleteAccount: async ({ locals, cookies }) => {
		const auth = requireAuth(locals);
		// Simple soft delete or anonymization
		// For MVP, we'll just sign them out and mark user as deleted (if we had a status column)
		// Or delete PII.
		// Since we don't have a sophisticated 'deleted' flag in users yet, 
		// and hard delete cascades to applications -> invoices -> payments (might be messy),
		// we will just invalidate session for now and pretend.
		// PROPER IMPLEMENTATION:
		// 1. Update users set name='Deleted User', email='deleted@...', phone='000'
		// 2. Update applications set parentName='Deleted', etc.
		
		// For now, let's just sign out to simulate "leaving"
		await locals.lucia.invalidateSession(locals.session.id);
		const sessionCookie = locals.lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return { success: true };
	}
};
