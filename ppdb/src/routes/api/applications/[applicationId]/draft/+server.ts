import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { applications } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { processCustomFieldsForSave } from '$lib/server/utils/custom-fields';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const { applicationId } = params;
	const { userId, tenantId } = locals;

	if (!userId || !tenantId) {
		throw error(401, 'Unauthorized');
	}

	let body;
	try {
		body = await request.json();
	} catch (_) {
		throw error(400, 'Invalid JSON body');
	}

	const {
		customFieldValues: clientValues = {},
		answeredCustomFields = [],
		currentStep = 1,
		version: clientVersion
	} = body;

	if (clientVersion === undefined) {
		throw error(400, 'Missing version for optimistic locking');
	}

	// 1. Verify ownership and get application details
	const existingApp = await db.query.applications.findFirst({
		where: and(
			eq(applications.id, applicationId),
			eq(applications.userId, userId),
			eq(applications.tenantId, tenantId)
		)
	});

	if (!existingApp) {
		throw error(404, 'Application not found');
	}

	// 2. Optimistic Locking
	if (existingApp.version !== clientVersion) {
		return new Response(
			JSON.stringify({
				message: 'Conflict: Application has been updated by another session',
				currentVersion: existingApp.version
			}),
			{ status: 409, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// 3. PII Encryption using shared utility
	const encryptedValues = await processCustomFieldsForSave(
		tenantId,
		existingApp.admissionPathId,
		clientValues
	);

	// 4. Update Database
	const nextVersion = existingApp.version + 1;
	await db
		.update(applications)
		.set({
			customFieldValues: JSON.stringify(encryptedValues),
			answeredCustomFields: JSON.stringify(answeredCustomFields),
			currentStep,
			version: nextVersion,
			updatedAt: new Date()
		})
		.where(eq(applications.id, applicationId));

	return json({ version: nextVersion });
};
