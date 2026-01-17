import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { applications, selectionResults, selectionResultDetails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getDraftRanking } from '$lib/server/ranking/ranking-service';

export const POST: RequestHandler = async ({ params, request }) => {
	const { pathId } = params as { pathId: string };

	if (!pathId) {
		return json({ error: 'Path ID is required' }, { status: 400 });
	}

	try {
		const body = await request.json();

		const quotaAccepted = Number(body.quotaAccepted);
		const quotaReserved = Number(body.quotaReserved);

		if (!Number.isInteger(quotaAccepted) || quotaAccepted < 0) {
			return json({ error: 'quotaAccepted must be a non-negative integer' }, { status: 400 });
		}

		if (!Number.isInteger(quotaReserved) || quotaReserved < 0) {
			return json({ error: 'quotaReserved must be a non-negative integer' }, { status: 400 });
		}

		const candidates = await getDraftRanking(pathId);

		if (candidates.length === 0) {
			return json({ error: 'Admission path not found or no candidates' }, { status: 404 });
		}

		const cutoffAccepted = quotaAccepted;
		const cutoffReserved = quotaAccepted + quotaReserved;

		const updates = candidates.map((candidate) => {
			let status: 'accepted' | 'waitlisted' | 'rejected';
			if (candidate.rank <= cutoffAccepted) {
				status = 'accepted';
			} else if (candidate.rank <= cutoffReserved) {
				status = 'waitlisted';
			} else {
				status = 'rejected';
			}
			return {
				applicationId: candidate.applicationId,
				status
			};
		});

		await db.transaction(async (tx) => {
			for (const update of updates) {
				await tx
					.update(applications)
					.set({ status: update.status })
					.where(eq(applications.id, update.applicationId));
			}

			const cutoffScores = candidates.map((c) => c.score);
			const cutoffAcceptedScore = cutoffAccepted > 0 ? cutoffScores[cutoffAccepted - 1] || 0 : null;
			const cutoffReservedScore = cutoffReserved > 0 ? cutoffScores[cutoffReserved - 1] || 0 : null;

			const [selectionResult] = await tx
				.insert(selectionResults)
				.values({
					admissionPathId: pathId,
					quotaAccepted,
					quotaReserved,
					totalCandidates: candidates.length,
					cutoffScoreAccepted: cutoffAcceptedScore,
					cutoffScoreReserved: cutoffReservedScore
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any)
				.returning();

			for (const candidate of candidates) {
				let status: 'accepted' | 'waitlisted' | 'rejected';
				if (candidate.rank <= cutoffAccepted) {
					status = 'accepted';
				} else if (candidate.rank <= cutoffReserved) {
					status = 'waitlisted';
				} else {
					status = 'rejected';
				}

				await tx.insert(selectionResultDetails).values({
					selectionResultId: selectionResult.id,
					applicationId: candidate.applicationId,
					rank: candidate.rank,
					status
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any);
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error finalizing ranking:', error);
		return json({ error: 'Failed to finalize ranking' }, { status: 500 });
	}
};
