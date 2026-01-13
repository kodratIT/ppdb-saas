import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { unlockScoreSchema } from '$lib/schema/score';

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'school_admin'); // Admin only

	const scoreId = params.scoreId;
	if (!scoreId) {
		throw svelteError(400, 'Score ID required');
	}

	const body = await request.json();

	// Validate reason
	const validationResult = unlockScoreSchema.safeParse(body);
	if (!validationResult.success) {
		throw svelteError(400, validationResult.error.issues[0].message);
	}

	const { reason } = validationResult.data;

	// Find score
	const score = await db.query.applicationScores.findFirst({
		where: and(eq(applicationScores.id, scoreId), eq(applicationScores.tenantId, auth.tenantId))
	});

	if (!score) {
		throw svelteError(404, 'Score not found');
	}

	if (!score.isFinalized) {
		throw svelteError(400, 'Score is not finalized');
	}

	// Wrap in transaction for atomicity
	await db.transaction(async (tx) => {
		// Unlock score
		const [unlocked] = await tx
			.update(applicationScores)
			.set({
				isFinalized: false,
				finalizedAt: null,
				unlockedBy: auth.userId,
				unlockedAt: new Date(),
				unlockReason: reason,
				updatedAt: new Date()
			})
			.where(eq(applicationScores.id, scoreId))
			.returning();

		// Audit log
		await tx.insert(auditLogs).values({
			actorId: auth.userId,
			action: 'unlock',
			target: `score:${scoreId}`,
			details: JSON.stringify({
				tenantId: auth.tenantId,
				applicationId: score.applicationId,
				reason,
				action: 'unlock_score'
			})
		});

		return json({
			success: true,
			message: 'Score unlocked successfully',
			score: unlocked
		});
	});
}
