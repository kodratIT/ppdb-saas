import { redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationDocuments } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const existingDraft = await db.query.applications.findFirst({
		where: and(
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'draft')
		)
	});

	if (!existingDraft) {
		throw redirect(303, `/${params.tenant}/register/form/step-1`);
	}

	// Fetch existing documents
	const documents = await db.query.applicationDocuments.findMany({
		where: and(
			eq(applicationDocuments.applicationId, existingDraft.id),
			eq(applicationDocuments.tenantId, auth.tenantId)
		)
	});

	return {
		draft: existingDraft,
		documents,
		tenantSlug: params.tenant
	};
}
