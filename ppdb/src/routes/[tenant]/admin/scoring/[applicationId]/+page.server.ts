import { error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({
	locals,
	params
}: RequestEvent<{ tenant: string; applicationId: string }>) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const { applicationId } = params;

	// Fetch application
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId)),
		with: {
			admissionPath: true
		}
	});

	if (!application) {
		throw svelteError(404, 'Application not found');
	}

	if (application.status !== 'verified') {
		throw svelteError(400, 'Application must be verified before scoring');
	}

	// Fetch existing score
	const score = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		),
		with: {
			scorer: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			},
			unlocker: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	return {
		application,
		score,
		tenantSlug: params.tenant,
		currentUserId: auth.userId,
		isAdmin: auth.session.role === 'school_admin'
	};
}
