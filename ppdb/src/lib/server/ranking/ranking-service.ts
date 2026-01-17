import { db } from '$lib/server/db';
import { applications, applicationScores } from '$lib/server/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';

export interface RankedCandidate {
	rank: number;
	applicationId: string;
	name: string;
	score: number;
	distance: number;
	age: number;
}

export async function getDraftRanking(admissionPathId: string): Promise<RankedCandidate[]> {
	const results = await db
		.select({
			applicationId: applications.id,
			name: applications.childFullName,
			score: applicationScores.score,
			distance: applications.distanceM,
			childDob: applications.childDob,
			createdAt: applications.createdAt
		})
		.from(applications)
		.innerJoin(applicationScores, eq(applications.id, applicationScores.applicationId))
		.where(
			and(
				eq(applications.admissionPathId, admissionPathId),
				eq(applications.status, 'verified'),
				eq(applicationScores.isFinalized, true)
			)
		)
		.orderBy(
			desc(applicationScores.score),
			asc(applications.distanceM),
			asc(applications.childDob),
			asc(applications.createdAt)
		);

	const now = new Date();
	const ranked = results.map((r, index) => {
		const age = r.childDob
			? Math.floor((now.getTime() - new Date(r.childDob).getTime()) / (1000 * 60 * 60 * 24 * 365))
			: 0;

		return {
			rank: index + 1,
			applicationId: r.applicationId,
			name: r.name || 'Unknown',
			score: r.score,
			distance: r.distance || 0,
			age
		};
	});

	return ranked;
}
