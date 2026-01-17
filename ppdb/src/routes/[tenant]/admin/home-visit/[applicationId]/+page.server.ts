import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { applications } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { submitHomeVisitReport, getHomeVisitReport } from '$lib/server/domain/home-visit';

export async function load({ params, locals }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'field_officer', 'school_admin');

	const { applicationId, tenant } = params;

	if (!applicationId) throw error(400, 'Application ID is required');

	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId))
	});

	if (!application) throw error(404, 'Application not found');

	const existingReport = await getHomeVisitReport(applicationId, auth.tenantId);

	return {
		application,
		existingReport,
		tenantSlug: tenant
	};
}

export const actions = {
	default: async ({ request, params, locals }: RequestEvent) => {
		const auth = await requireAuth(locals);
		requireRole(auth, 'field_officer', 'school_admin');

		const { applicationId } = params;
		if (!applicationId) return fail(400, { message: 'Application ID is required' });

		const formData = await request.formData();

		const roof = formData.get('roof') as string;
		const floor = formData.get('floor') as string;
		const walls = formData.get('walls') as string;
		const summary = formData.get('summary') as string;
		const recommendation = formData.get('recommendation') as string;
		const gpsLocation = formData.get('gpsLocation') as string;

		// Get photos - they will be sent as base64 strings from the client for now
		// In a real production app, these should be uploaded to R2 and we'd get URLs back
		const photoData = formData.getAll('photos') as string[];
		const photoCaptions = formData.getAll('captions') as string[];

		try {
			await submitHomeVisitReport({
				applicationId,
				tenantId: auth.tenantId,
				officerId: auth.userId,
				surveyData: { roof, floor, walls },
				gpsLocation,
				summary,
				recommendation,
				photos: photoData.map((data, i) => ({
					url: data, // This is base64 for now
					caption: photoCaptions[i] || ''
				}))
			});

			return { success: true };
		} catch (err) {
			console.error('Home visit submission error:', err);
			return fail(500, { message: 'Gagal menyimpan laporan kunjungan rumah' });
		}
	}
};
