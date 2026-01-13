import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import {
	tenants,
	users,
	applications,
	applicationScores,
	admissionPaths
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getDraftRanking } from '$lib/server/ranking/ranking-service';

describe('Ranking Service', () => {
	let testTenantId: string;
	let testPathId: string;
	let parentId: string;
	let applicationIds: string[];

	beforeAll(async () => {
		const [tenant] = await db
			.insert(tenants)
			.values({
				name: 'Test School - Ranking',
				slug: 'test-ranking-school',
				status: 'active'
			})
			.returning();
		testTenantId = tenant.id;

		const [path] = await db
			.insert(admissionPaths)
			.values({
				tenantId: testTenantId,
				name: 'Jalur Regular',
				quota: 100,
				status: 'open'
			})
			.returning();
		testPathId = path.id;

		const [parent] = await db
			.insert(users)
			.values({
				email: 'parent@test.com',
				tenantId: testTenantId,
				role: 'parent',
				status: 'active'
			})
			.returning();
		parentId = parent.id;

		const baseDate = new Date('2020-01-01');

		const [app1, app2, app3, app4] = await db
			.insert(applications)
			.values([
				{
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'verified',
					childFullName: 'Child High Score',
					childDob: new Date('2015-01-01'),
					distanceM: 5000,
					createdAt: new Date('2025-01-01')
				},
				{
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'verified',
					childFullName: 'Child Low Score',
					childDob: new Date('2015-01-01'),
					distanceM: 100,
					createdAt: new Date('2025-01-01')
				},
				{
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'verified',
					childFullName: 'Child Close Distance',
					childDob: new Date('2015-01-01'),
					distanceM: 100,
					createdAt: new Date('2025-01-01')
				},
				{
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'verified',
					childFullName: 'Child Older',
					childDob: new Date('2014-01-01'),
					distanceM: 1000,
					createdAt: new Date('2025-01-02')
				}
			])
			.returning();

		applicationIds = [app1.id, app2.id, app3.id, app4.id];

		await db.insert(applicationScores).values([
			{
				applicationId: app1.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 90,
				isFinalized: true
			},
			{
				applicationId: app2.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 70,
				isFinalized: true
			},
			{
				applicationId: app3.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 85,
				isFinalized: true
			},
			{
				applicationId: app4.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 85,
				isFinalized: true
			}
		]);
	});

	afterAll(async () => {
		await db.delete(applicationScores).where(eq(applicationScores.tenantId, testTenantId));
		await db.delete(applications).where(eq(applications.tenantId, testTenantId));
		await db.delete(admissionPaths).where(eq(admissionPaths.tenantId, testTenantId));
		await db.delete(users).where(eq(users.tenantId, testTenantId));
		await db.delete(tenants).where(eq(tenants.id, testTenantId));
	});

	describe('getDraftRanking', () => {
		it('should rank candidates by score (highest first)', async () => {
			const ranking = await getDraftRanking(testPathId);

			expect(ranking.length).toBeGreaterThan(0);

			const rankedScores = ranking.map((r) => r.score);
			const sortedScores = [...rankedScores].sort((a, b) => b - a);

			expect(rankedScores).toEqual(sortedScores);
		});

		it('should tie-break by distance (closest first)', async () => {
			const ranking = await getDraftRanking(testPathId);

			const tiedCandidates = ranking.filter((r) => r.score === 85);

			expect(tiedCandidates.length).toBeGreaterThanOrEqual(2);

			const sortedByDistance = [...tiedCandidates].sort((a, b) => a.distance - b.distance);
			expect(tiedCandidates).toEqual(sortedByDistance);
		});

		it('should tie-break by age (older first)', async () => {
			const ranking = await getDraftRanking(testPathId);

			const sameScoreDistance = ranking.filter((r) => r.score === 85);

			if (sameScoreDistance.length >= 2) {
				const sortedByAge = [...sameScoreDistance].sort((a, b) => a.age - b.age);
				expect(sameScoreDistance).toEqual(sortedByAge);
			}
		});

		it('should only include verified applications with finalized scores', async () => {
			const [unverifiedApp] = await db
				.insert(applications)
				.values({
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'submitted',
					childFullName: 'Unverified Child',
					childDob: new Date('2015-01-01')
				})
				.returning();

			await db.insert(applicationScores).values({
				applicationId: unverifiedApp.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 95,
				isFinalized: true
			});

			const ranking = await getDraftRanking(testPathId);

			expect(ranking.some((r) => r.name === 'Unverified Child')).toBe(false);

			await db.delete(applicationScores).where(eq(applicationScores.applicationId, unverifiedApp.id));
			await db.delete(applications).where(eq(applications.id, unverifiedApp.id));
		});

		it('should only include applications with finalized scores', async () => {
			const [nonFinalizedApp] = await db
				.insert(applications)
				.values({
					tenantId: testTenantId,
					userId: parentId,
					admissionPathId: testPathId,
					status: 'verified',
					childFullName: 'Non Finalized Child',
					childDob: new Date('2015-01-01')
				})
				.returning();

			await db.insert(applicationScores).values({
				applicationId: nonFinalizedApp.id,
				tenantId: testTenantId,
				scorerId: parentId,
				score: 95,
				isFinalized: false
			});

			const ranking = await getDraftRanking(testPathId);

			expect(ranking.some((r) => r.name === 'Non Finalized Child')).toBe(false);

			await db.delete(applicationScores).where(eq(applicationScores.applicationId, nonFinalizedApp.id));
			await db.delete(applications).where(eq(applications.id, nonFinalizedApp.id));
		});
	});
});
