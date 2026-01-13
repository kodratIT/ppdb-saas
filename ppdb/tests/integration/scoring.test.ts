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

describe('Scoring Integration Tests', () => {
	let testTenantId: string;
	let testInterviewerId: string;
	let testApplicationId: string;
	let testPathId: string;

	beforeAll(async () => {
		// Create test tenant
		const [tenant] = await db
			.insert(tenants)
			.values({
				name: 'Test School - Scoring',
				slug: 'test-scoring-school',
				status: 'active'
			})
			.returning();
		testTenantId = tenant.id;

		// Create admission path
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

		// Create interviewer user
		const [interviewer] = await db
			.insert(users)
			.values({
				email: 'interviewer@test.com',
				tenantId: testTenantId,
				role: 'interviewer',
				name: 'Test Interviewer',
				status: 'active'
			})
			.returning();
		testInterviewerId = interviewer.id;

		// Create verified application
		const [parent] = await db
			.insert(users)
			.values({
				email: 'parent@test.com',
				tenantId: testTenantId,
				role: 'parent',
				status: 'active'
			})
			.returning();

		const [application] = await db
			.insert(applications)
			.values({
				tenantId: testTenantId,
				userId: parent.id,
				admissionPathId: testPathId,
				status: 'verified', // Ready for scoring
				childFullName: 'Test Child',
				parentFullName: 'Test Parent',
				parentPhone: '081234567890'
			})
			.returning();
		testApplicationId = application.id;
	});

	afterAll(async () => {
		// Cleanup
		await db.delete(applicationScores).where(eq(applicationScores.tenantId, testTenantId));
		await db.delete(applications).where(eq(applications.tenantId, testTenantId));
		await db.delete(admissionPaths).where(eq(admissionPaths.tenantId, testTenantId));
		await db.delete(users).where(eq(users.tenantId, testTenantId));
		await db.delete(tenants).where(eq(tenants.id, testTenantId));
	});

	describe('Create Score', () => {
		it('should create score for verified application', async () => {
			const [score] = await db
				.insert(applicationScores)
				.values({
					applicationId: testApplicationId,
					tenantId: testTenantId,
					scorerId: testInterviewerId,
					score: 85,
					notes: 'Good candidate',
					isFinalized: false
				})
				.returning();

			expect(score).toBeDefined();
			expect(score.score).toBe(85);
			expect(score.isFinalized).toBe(false);
		});

		it('should enforce UNIQUE constraint on application', async () => {
			// Try to create duplicate score
			await expect(
				db.insert(applicationScores).values({
					applicationId: testApplicationId,
					tenantId: testTenantId,
					scorerId: testInterviewerId,
					score: 90,
					notes: 'Duplicate'
				})
			).rejects.toThrow();
		});
	});

	describe('Finalize Score', () => {
		it('should finalize draft score', async () => {
			const existingScore = await db.query.applicationScores.findFirst({
				where: eq(applicationScores.applicationId, testApplicationId)
			});

			const [finalized] = await db
				.update(applicationScores)
				.set({
					isFinalized: true,
					finalizedAt: new Date()
				})
				.where(eq(applicationScores.id, existingScore!.id))
				.returning();

			expect(finalized.isFinalized).toBe(true);
			expect(finalized.finalizedAt).toBeDefined();
		});
	});

	describe('Unlock Score', () => {
		it('should unlock finalized score with reason', async () => {
			const adminId = testInterviewerId; // Simulate admin

			const existingScore = await db.query.applicationScores.findFirst({
				where: eq(applicationScores.applicationId, testApplicationId)
			});

			const [unlocked] = await db
				.update(applicationScores)
				.set({
					isFinalized: false,
					finalizedAt: null,
					unlockedBy: adminId,
					unlockedAt: new Date(),
					unlockReason: 'Correction needed - wrong score entered'
				})
				.where(eq(applicationScores.id, existingScore!.id))
				.returning();

			expect(unlocked.isFinalized).toBe(false);
			expect(unlocked.unlockedBy).toBe(adminId);
			expect(unlocked.unlockReason).toBeDefined();
		});
	});
});
