import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function POST({ locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const applicationId = params.applicationId;
	if (!applicationId) {
		throw svelteError(400, 'Application ID required');
	}

	// Find score
	const score = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		)
	});

	if (!score) {
		throw svelteError(404, 'Score not found');
	}

	if (score.isFinalized) {
		throw svelteError(400, 'Score is already finalized');
	}

	// Wrap in transaction for atomicity
	await db.transaction(async (tx) => {
		// Finalize score
		const [finalized] = await tx
			.update(applicationScores)
			.set({
				isFinalized: true,
				finalizedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(applicationScores.id, score.id))
			.returning();

		// Audit log
		await tx.insert(auditLogs).values({
			actorId: auth.userId,
			action: 'finalize',
			target: `score:${score.id}`,
			details: JSON.stringify({
				tenantId: auth.tenantId,
				applicationId,
				score: score.score,
				action: 'finalize_score'
			})
		});

		return json({
			success: true,
			message: 'Score finalized successfully',
			score: finalized
		});
	});
}
