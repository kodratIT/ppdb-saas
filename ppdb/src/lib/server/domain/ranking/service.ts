/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import {
	applications,
	applicationScores,
	admissionPaths,
	selectionResults,
	selectionResultDetails
} from '$lib/server/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';

export interface RankingCandidate {
	id: string; // application id
	rank: number;
	name: string;
	score: number;
	distance: number | null;
	age: number | null; // derived from dob
	status: string; // current status
	estimatedStatus: 'accepted' | 'reserved' | 'rejected';
}

export class RankingService {
	static async getDraftRanking(pathId: string, quotas?: { accepted: number; reserved: number }) {
		// 1. Fetch path to get default quotas if not provided
		const path = await db.query.admissionPaths.findFirst({
			where: eq(admissionPaths.id, pathId)
		});

		if (!path) {
			throw new Error('Admission path not found');
		}

		const quotaAccepted = quotas?.accepted ?? path.quota;
		const quotaReserved = quotas?.reserved ?? 0;

		// 2. Fetch verified applications with scores
		const apps = await db
			.select({
				id: applications.id,
				name: applications.childFullName,
				dob: applications.childDob,
				distance: applications.distanceM,
				status: applications.status,
				score: applicationScores.score
			})
			.from(applications)
			.leftJoin(applicationScores, eq(applications.id, applicationScores.applicationId))
			.where(and(eq(applications.admissionPathId, pathId), eq(applications.status, 'verified')))
			.orderBy(
				desc(applicationScores.score), // Primary: higher score
				asc(applications.distanceM), // Secondary: shorter distance
				asc(applications.childDob) // Tertiary: older (earlier dob)
			);

		// 3. Process candidates
		const candidates: RankingCandidate[] = apps.map((app, index) => {
			const rank = index + 1;
			let estimatedStatus: 'accepted' | 'reserved' | 'rejected' = 'rejected';

			if (rank <= quotaAccepted) {
				estimatedStatus = 'accepted';
			} else if (rank <= quotaAccepted + quotaReserved) {
				estimatedStatus = 'reserved';
			}

			// Calculate age (simplified)
			let age: number | null = null;
			if (app.dob) {
				const diff = Date.now() - new Date(app.dob).getTime();
				age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
			}

			return {
				id: app.id,
				rank,
				name: app.name ?? 'Unknown',
				score: app.score ?? 0,
				distance: app.distance,
				age,
				status: app.status,
				estimatedStatus
			};
		});

		return {
			pathId,
			pathName: path.name,
			quota: path.quota,
			candidates,
			totals: {
				accepted: candidates.filter((c) => c.estimatedStatus === 'accepted').length,
				reserved: candidates.filter((c) => c.estimatedStatus === 'reserved').length,
				rejected: candidates.filter((c) => c.estimatedStatus === 'rejected').length
			}
		};
	}

	static async finalizeRanking(
		pathId: string,
		quotas: { accepted: number; reserved: number },
		userId: string
	) {
		const ranking = await this.getDraftRanking(pathId, quotas);

		// 1. Create Selection Result
		const [result] = await db
			.insert(selectionResults)
			.values({
				tenantId: ranking.candidates[0]?.id
					? await this.getTenantId(ranking.candidates[0].id)
					: await this.getTenantIdFromPath(pathId), // Helper needed or fetch via join
				admissionPathId: pathId,
				quotaAccepted: quotas.accepted,
				quotaReserved: quotas.reserved,
				totalCandidates: ranking.candidates.length,
				finalizedBy: userId,
				finalizedAt: new Date()
			})
			.returning();

		// 2. Update Applications & Create Details
		for (const candidate of ranking.candidates) {
			// Update Application Status
			let newStatus = 'rejected'; // Default
			if (candidate.estimatedStatus === 'accepted') newStatus = 'accepted';
			else if (candidate.estimatedStatus === 'reserved') newStatus = 'waitlisted'; // Map reserved to waitlisted in DB?
			// Enum: 'draft', 'submitted', 'under_review', 'verified', 'accepted', 'rejected', 'waitlisted'

			await db
				.update(applications)
				.set({ status: newStatus as any })
				.where(eq(applications.id, candidate.id));

			// Create Detail
			await db.insert(selectionResultDetails).values({
				selectionResultId: result.id,
				applicationId: candidate.id,
				rank: candidate.rank,
				totalScore: candidate.score.toString(),
				status: candidate.estimatedStatus
			});
		}

		return result;
	}

	private static async getTenantId(applicationId: string) {
		const app = await db.query.applications.findFirst({
			where: eq(applications.id, applicationId),
			columns: { tenantId: true }
		});
		if (!app) throw new Error('Application not found');
		return app.tenantId;
	}

	private static async getTenantIdFromPath(pathId: string) {
		const path = await db.query.admissionPaths.findFirst({
			where: eq(admissionPaths.id, pathId),
			columns: { tenantId: true }
		});
		if (!path) throw new Error('Admission path not found');
		return path.tenantId;
	}
}
