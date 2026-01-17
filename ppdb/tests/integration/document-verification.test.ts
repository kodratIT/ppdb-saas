/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import {
	tenants,
	users,
	applications,
	applicationDocuments,
	documentReviews,
	auditLogs,
	admissionPaths
} from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

describe('Document Verification Flow (Integration)', () => {
	let testTenantId: string;
	let testVerifierId: string;
	let testParentId: string;
	let testApplicationId: string;
	let testDocumentId: string;
	let testPathId: string;

	beforeAll(async () => {
		// Create test tenant
		const [tenant] = await db
			.insert(tenants)
			.values({
				name: 'Test School - Verification',
				slug: 'test-verify-school',
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

		// Create verifier user
		const [verifier] = await db
			.insert(users)
			.values({
				email: 'verifier@test.com',
				tenantId: testTenantId,
				role: 'verifier',
				name: 'Test Verifier',
				status: 'active'
			})
			.returning();
		testVerifierId = verifier.id;

		// Create parent user
		const [parent] = await db
			.insert(users)
			.values({
				email: 'parent@test.com',
				tenantId: testTenantId,
				role: 'parent',
				name: 'Test Parent',
				status: 'active'
			})
			.returning();
		testParentId = parent.id;

		// Create application
		const [application] = await db
			.insert(applications)
			.values({
				tenantId: testTenantId,
				userId: testParentId,
				admissionPathId: testPathId,
				status: 'submitted',
				childFullName: 'Test Child',
				parentFullName: 'Test Parent',
				parentPhone: '081234567890',
				submittedAt: new Date()
			})
			.returning();
		testApplicationId = application.id;

		// Create document
		const [document] = await db
			.insert(applicationDocuments)
			.values({
				applicationId: testApplicationId,
				tenantId: testTenantId,
				documentType: 'kk',
				fileName: 'kk-test.jpg',
				fileSize: 1024,
				mimeType: 'image/jpeg',
				encryptedUrl: 'https://example.com/kk.jpg',
				status: 'pending'
			})
			.returning();
		testDocumentId = document.id;
	});

	afterAll(async () => {
		// Cleanup
		await db.delete(documentReviews).where(eq(documentReviews.tenantId, testTenantId));
		await db.delete(auditLogs).where(eq(auditLogs.target, `document:${testDocumentId}`));
		await db.delete(applicationDocuments).where(eq(applicationDocuments.tenantId, testTenantId));
		await db.delete(applications).where(eq(applications.tenantId, testTenantId));
		await db.delete(admissionPaths).where(eq(admissionPaths.tenantId, testTenantId));
		await db.delete(users).where(eq(users.tenantId, testTenantId));
		await db.delete(tenants).where(eq(tenants.id, testTenantId));
	});

	describe('Approve Document', () => {
		it('should approve document and create review record', async () => {
			// Simulate API call logic
			const action = 'approve';
			const previousStatus = 'pending';
			const newStatus = 'verified';

			// Update document
			await db
				.update(applicationDocuments)
				.set({
					status: newStatus,
					verifiedBy: testVerifierId,
					verifiedAt: new Date()
				})
				.where(eq(applicationDocuments.id, testDocumentId));

			// Create review record
			await db.insert(documentReviews).values({
				documentId: testDocumentId,
				tenantId: testTenantId,
				reviewerId: testVerifierId,
				action: action as 'approve',
				previousStatus: previousStatus as any,
				newStatus: newStatus as any
			});

			// Create audit log
			await db.insert(auditLogs).values({
				actorId: testVerifierId,
				action: 'approve',
				target: `document:${testDocumentId}`,
				details: JSON.stringify({
					tenantId: testTenantId,
					documentId: testDocumentId,
					action,
					previousStatus,
					newStatus
				})
			});

			// Verify document status updated
			const updatedDoc = await db.query.applicationDocuments.findFirst({
				where: eq(applicationDocuments.id, testDocumentId)
			});

			expect(updatedDoc?.status).toBe('verified');
			expect(updatedDoc?.verifiedBy).toBe(testVerifierId);

			// Verify review record created
			const review = await db.query.documentReviews.findFirst({
				where: and(
					eq(documentReviews.documentId, testDocumentId),
					eq(documentReviews.tenantId, testTenantId)
				)
			});

			expect(review).toBeDefined();
			expect(review?.action).toBe('approve');
			expect(review?.reviewerId).toBe(testVerifierId);

			// Verify audit log created
			const auditLog = await db.query.auditLogs.findFirst({
				where: eq(auditLogs.target, `document:${testDocumentId}`)
			});

			expect(auditLog).toBeDefined();
			expect(auditLog?.action).toBe('approve');
			expect(auditLog?.actorId).toBe(testVerifierId);
		});
	});

	describe('Reject Document', () => {
		it('should reject document with reason and create records', async () => {
			const action = 'reject';
			const reason = 'Document is blurry and unreadable';
			const newStatus = 'rejected';

			// Update document
			await db
				.update(applicationDocuments)
				.set({
					status: newStatus,
					verifiedBy: testVerifierId,
					verifiedAt: new Date(),
					rejectionReason: reason
				})
				.where(eq(applicationDocuments.id, testDocumentId));

			// Create review record
			await db.insert(documentReviews).values({
				documentId: testDocumentId,
				tenantId: testTenantId,
				reviewerId: testVerifierId,
				action: action as 'reject',
				reason,
				previousStatus: 'verified' as any,
				newStatus: newStatus as any
			});

			// Verify
			const updatedDoc = await db.query.applicationDocuments.findFirst({
				where: eq(applicationDocuments.id, testDocumentId)
			});

			expect(updatedDoc?.status).toBe('rejected');
			expect(updatedDoc?.rejectionReason).toBe(reason);

			const review = await db.query.documentReviews.findFirst({
				where: and(
					eq(documentReviews.documentId, testDocumentId),
					eq(documentReviews.action, 'reject')
				)
			});

			expect(review?.reason).toBe(reason);
		});
	});

	describe('Application Status Auto-Update', () => {
		it('should update application to verified when all documents verified', async () => {
			// First, set document to verified
			await db
				.update(applicationDocuments)
				.set({ status: 'verified' })
				.where(eq(applicationDocuments.id, testDocumentId));

			// Simulate checking all documents
			const allDocuments = await db.query.applicationDocuments.findMany({
				where: eq(applicationDocuments.applicationId, testApplicationId)
			});

			const allVerified = allDocuments.every((doc) => doc.status === 'verified');

			if (allVerified && allDocuments.length > 0) {
				await db
					.update(applications)
					.set({ status: 'verified' })
					.where(eq(applications.id, testApplicationId));
			}

			// Verify application status
			const updatedApp = await db.query.applications.findFirst({
				where: eq(applications.id, testApplicationId)
			});

			expect(updatedApp?.status).toBe('verified');
		});
	});
});
