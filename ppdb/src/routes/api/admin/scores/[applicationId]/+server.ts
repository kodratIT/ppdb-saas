import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { scoreInputSchema } from '$lib/schema/score';

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const applicationId = (params as any).applicationId as string;
	if (!applicationId) {
		throw svelteError(400, 'Application ID required');
	}

	// Parse and validate input
	const body = await request.json();
	const validationResult = scoreInputSchema.safeParse(body);

	if (!validationResult.success) {
		throw svelteError(400, validationResult.error.issues[0].message);
	}

	const { score, notes, finalize } = validationResult.data;

	// Verify application exists and is verified
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId))
	});

	if (!application) {
		throw svelteError(404, 'Application not found');
	}

	if (application.status !== 'verified') {
		throw svelteError(400, 'Application must be verified before scoring');
	}

	// Check for existing score
	const existingScore = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		)
	});

	// If exists and finalized, cannot edit
	if (existingScore?.isFinalized) {
		throw svelteError(403, 'Score is finalized. Contact admin to unlock.');
	}

	try {
		let savedScore;

		if (existingScore) {
			// Update existing score
			const [updated] = await db
				.update(applicationScores)
				.set({
					score,
					notes: notes || null,
					isFinalized: finalize || existingScore.isFinalized,
					finalizedAt: finalize ? new Date() : existingScore.finalizedAt,
					updatedAt: new Date()
				})
				.where(eq(applicationScores.id, existingScore.id))
				.returning();

			savedScore = updated;
		} else {
			// Create new score
			const [created] = await db
				.insert(applicationScores)
				.values({
					applicationId,
					tenantId: auth.tenantId,
					scorerId: auth.userId,
					score,
					notes: notes || null,
					isFinalized: finalize || false,
					finalizedAt: finalize ? new Date() : null
				})
				.returning();

			savedScore = created;
		}

		// Create audit log if finalized
		if (finalize && !existingScore?.isFinalized) {
			await db.insert(auditLogs).values({
				actorId: auth.userId,
				action: 'finalize',
				target: `score:${savedScore.id}`,
				details: JSON.stringify({
					tenantId: auth.tenantId,
					applicationId,
					score,
					action: 'finalize_score'
				})
			});
		}

		return json({
			success: true,
			message: finalize ? 'Score finalized successfully' : 'Score saved as draft',
			score: savedScore
		});
	} catch (error) {
		console.error('Score creation error:', error);
		throw svelteError(500, 'Failed to save score');
	}
}
