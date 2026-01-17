/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import {
	tenants,
	users,
	admissionPaths,
	applications,
	applicationScores,
	selectionResults,
	selectionResultDetails
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

describe('Ranking API Endpoints - Integration Tests', () => {
	let testTenantId: string;
	let testUserId: string;
	let testAdmissionPathId: string;
	const testApplicationIds: string[] = [];

	beforeAll(async () => {
		// Create test tenant
		const [tenant] = await db
			.insert(tenants)
			.values({
				name: 'Test School for Ranking API',
				slug: `test-ranking-api-${Date.now()}`,
				status: 'active'
			})
			.returning();
		testTenantId = tenant.id;

		// Create test user
		const [user] = await db
			.insert(users)
			.values({
				email: `test-ranking-api-${Date.now()}@test.com`,
				tenantId: testTenantId,
				name: 'Test Admin',
				role: 'school_admin',
				status: 'active'
			})
			.returning();
		testUserId = user.id;

		// Create admission path
		const [path] = await db
			.insert(admissionPaths)
			.values({
				tenantId: testTenantId,
				name: 'Test Admission Path',
				description: 'Test Path for Ranking',
				quota: 100,
				status: 'open'
			})
			.returning();
		testAdmissionPathId = path.id;

		// Create 5 test applications with scores
		const testData = [
			{ name: 'Student A', score: 95, distance: 1000 },
			{ name: 'Student B', score: 90, distance: 1500 },
			{ name: 'Student C', score: 85, distance: 2000 },
			{ name: 'Student D', score: 80, distance: 2500 },
			{ name: 'Student E', score: 75, distance: 3000 }
		];

		for (const data of testData) {
			const [application] = await db
				.insert(applications)
				.values({
					tenantId: testTenantId,
					userId: testUserId,
					admissionPathId: testAdmissionPathId,
					status: 'verified',
					childFullName: data.name,
					childDob: new Date('2010-01-01'),
					distance_m: data.distance,
					submittedAt: new Date()
				})
				.returning();
			testApplicationIds.push(application.id);

			// Add score
			await db.insert(applicationScores).values({
				applicationId: application.id,
				tenantId: testTenantId,
				scorerId: testUserId,
				score: data.score,
				isFinalized: true
			});
		}
	});

	afterAll(async () => {
		// Cleanup in reverse order of dependencies
		if (testApplicationIds.length > 0) {
			for (const id of testApplicationIds) {
				await db.delete(applicationScores).where(eq(applicationScores.applicationId, id));
				await db.delete(applications).where(eq(applications.id, id));
			}
		}
		if (testAdmissionPathId) {
			await db.delete(admissionPaths).where(eq(admissionPaths.id, testAdmissionPathId));
		}
		if (testUserId) {
			await db.delete(users).where(eq(users.id, testUserId));
		}
		if (testTenantId) {
			await db.delete(tenants).where(eq(tenants.id, testTenantId));
		}
	});

	describe('GET /api/admin/ranking/[pathId]', () => {
		it('returns draft ranking for valid path', async () => {
			// Import the GET handler from the route
			const { GET } = await import('../../src/routes/api/admin/ranking/[pathId]/+server');

			const mockParams = { pathId: testAdmissionPathId };
			const response = await GET({ params: mockParams } as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toHaveProperty('admissionPathId', testAdmissionPathId);
			expect(data).toHaveProperty('candidates');
			expect(Array.isArray(data.candidates)).toBe(true);
			expect(data.candidates).toHaveLength(5);

			// Verify ordering (highest score first)
			expect(data.candidates[0].rank).toBe(1);
			expect(data.candidates[0].score).toBe(95);
			expect(data.candidates[0].name).toBe('Student A');

			expect(data.candidates[4].rank).toBe(5);
			expect(data.candidates[4].score).toBe(75);
			expect(data.candidates[4].name).toBe('Student E');
		});

		it('returns 404 for non-existent path', async () => {
			const { GET } = await import('../../src/routes/api/admin/ranking/[pathId]/+server');

			const fakeId = '00000000-0000-0000-0000-000000000000';
			const mockParams = { pathId: fakeId };
			const response = await GET({ params: mockParams } as any);

			expect(response.status).toBe(404);
			const data = await response.json();
			expect(data).toHaveProperty('error');
		});
	});

	describe('POST /api/admin/ranking/[pathId]/finalize', () => {
		it('finalizes ranking with correct status assignment', async () => {
			const { POST } = await import('../../src/routes/api/admin/ranking/[pathId]/finalize/+server');

			const mockRequest = {
				json: async () => ({
					quotaAccepted: 2,
					quotaReserved: 2
				})
			};
			const mockParams = { pathId: testAdmissionPathId };
			const response = await POST({ request: mockRequest, params: mockParams } as any);

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toHaveProperty('success', true);

			// Verify application statuses
			const apps = await db
				.select()
				.from(applications)
				.where(eq(applications.admissionPathId, testAdmissionPathId));

			// Top 2 should be accepted (ranks 1-2)
			const acceptedCount = apps.filter((a) => a.status === 'accepted').length;
			expect(acceptedCount).toBe(2);

			// Next 2 should be waitlisted (ranks 3-4)
			const waitlistedCount = apps.filter((a) => a.status === 'waitlisted').length;
			expect(waitlistedCount).toBe(2);

			// Last 1 should be rejected (rank 5)
			const rejectedCount = apps.filter((a) => a.status === 'rejected').length;
			expect(rejectedCount).toBe(1);

			// Verify selection result was created
			const selectionResult = await db
				.select()
				.from(selectionResults)
				.where(eq(selectionResults.admissionPathId, testAdmissionPathId))
				.limit(1);

			expect(selectionResult).toHaveLength(1);
			expect(selectionResult[0].quotaAccepted).toBe(2);
			expect(selectionResult[0].quotaReserved).toBe(2);
			expect(selectionResult[0].totalCandidates).toBe(5);

			// Verify selection result details
			const details = await db
				.select()
				.from(selectionResultDetails)
				.where(eq(selectionResultDetails.selectionResultId, selectionResult[0].id));

			expect(details).toHaveLength(5);
		});

		it('validates quota inputs (non-negative)', async () => {
			const { POST } = await import('../../src/routes/api/admin/ranking/[pathId]/finalize/+server');

			const mockRequest = {
				json: async () => ({
					quotaAccepted: -1,
					quotaReserved: 2
				})
			};
			const mockParams = { pathId: testAdmissionPathId };
			const response = await POST({ request: mockRequest, params: mockParams } as any);

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data).toHaveProperty('error');
		});

		it('returns 404 for non-existent path', async () => {
			const { POST } = await import('../../src/routes/api/admin/ranking/[pathId]/finalize/+server');

			const fakeId = '00000000-0000-0000-0000-000000000000';
			const mockRequest = {
				json: async () => ({
					quotaAccepted: 2,
					quotaReserved: 2
				})
			};
			const mockParams = { pathId: fakeId };
			const response = await POST({ request: mockRequest, params: mockParams } as any);

			expect(response.status).toBe(404);
		});
	});
});
