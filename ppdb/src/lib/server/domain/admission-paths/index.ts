import { eq, and } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import {
	admissionPathCreateSchema,
	admissionPathUpdateSchema,
	isValidTransition,
	validateQuotaUpdate,
	type AdmissionPathStatus
} from '../../../schema/admission-path';
import { ZodError } from 'zod';

export type AdmissionPath = typeof schema.admissionPaths.$inferSelect;
export type NewAdmissionPath = typeof schema.admissionPaths.$inferInsert;

/**
 * Custom error for business rule violations
 */
export class BusinessRuleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BusinessRuleError';
	}
}

/**
 * List all admission paths for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @returns Array of admission paths
 */
export async function listAdmissionPaths(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string
): Promise<AdmissionPath[]> {
	return await db
		.select()
		.from(schema.admissionPaths)
		.where(eq(schema.admissionPaths.tenantId, tenantId));
}

/**
 * Get admission path by ID for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param pathId - Admission path ID
 * @returns Admission path or null if not found
 */
export async function getAdmissionPathById(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<AdmissionPath | null> {
	const results = await db
		.select()
		.from(schema.admissionPaths)
		.where(and(eq(schema.admissionPaths.id, pathId), eq(schema.admissionPaths.tenantId, tenantId)));

	return results[0] || null;
}

/**
 * Create new admission path
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param data - Admission path data
 * @returns Created admission path
 */
export async function createAdmissionPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	data: any
): Promise<AdmissionPath> {
	// Validate input
	const validatedData = admissionPathCreateSchema.parse(data);

	const created = await db
		.insert(schema.admissionPaths)
		.values({
			tenantId,
			name: validatedData.name,
			description: validatedData.description || null,
			quota: validatedData.quota,
			filledSlots: 0,
			status: validatedData.status || 'draft'
		})
		.returning();

	return created[0];
}

/**
 * Update admission path
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param pathId - Admission path ID
 * @param data - Update data
 * @returns Updated admission path
 */
export async function updateAdmissionPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string,
	data: any
): Promise<AdmissionPath> {
	// Validate input
	const validatedData = admissionPathUpdateSchema.parse(data);

	// If quota is being updated, check business rule
	if (validatedData.quota !== undefined) {
		const currentPath = await getAdmissionPathById(db, tenantId, pathId);
		if (!currentPath) {
			throw new BusinessRuleError('Admission path not found');
		}

		if (!validateQuotaUpdate(validatedData.quota, currentPath.filledSlots)) {
			throw new BusinessRuleError('Cannot reduce quota below current filled slots');
		}
	}

	const updated = await db
		.update(schema.admissionPaths)
		.set({ ...validatedData, updatedAt: new Date() })
		.where(and(eq(schema.admissionPaths.id, pathId), eq(schema.admissionPaths.tenantId, tenantId)))
		.returning();

	if (updated.length === 0) {
		throw new BusinessRuleError('Admission path not found');
	}

	return updated[0];
}

/**
 * Delete admission path
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param pathId - Admission path ID
 */
export async function deleteAdmissionPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<void> {
	// Check if path has filled slots
	const currentPath = await getAdmissionPathById(db, tenantId, pathId);
	if (!currentPath) {
		throw new BusinessRuleError('Admission path not found');
	}

	if (currentPath.filledSlots > 0) {
		throw new BusinessRuleError('Cannot delete admission path with filled slots');
	}

	await db
		.delete(schema.admissionPaths)
		.where(and(eq(schema.admissionPaths.id, pathId), eq(schema.admissionPaths.tenantId, tenantId)));
}

/**
 * Helper function to transition status
 */
async function transitionStatus(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string,
	toStatus: AdmissionPathStatus
): Promise<AdmissionPath> {
	const currentPath = await getAdmissionPathById(db, tenantId, pathId);
	if (!currentPath) {
		throw new BusinessRuleError('Admission path not found');
	}

	// Validate transition
	if (!isValidTransition(currentPath.status as AdmissionPathStatus, toStatus)) {
		throw new BusinessRuleError(
			`Invalid status transition from ${currentPath.status} to ${toStatus}`
		);
	}

	const updated = await db
		.update(schema.admissionPaths)
		.set({ status: toStatus, updatedAt: new Date() })
		.where(and(eq(schema.admissionPaths.id, pathId), eq(schema.admissionPaths.tenantId, tenantId)))
		.returning();

	return updated[0];
}

/**
 * Publish admission path (draft → open)
 */
export async function publishPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<AdmissionPath> {
	return await transitionStatus(db, tenantId, pathId, 'open');
}

/**
 * Close admission path (open → closed)
 */
export async function closePath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<AdmissionPath> {
	return await transitionStatus(db, tenantId, pathId, 'closed');
}

/**
 * Reopen admission path (closed → open)
 */
export async function reopenPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<AdmissionPath> {
	return await transitionStatus(db, tenantId, pathId, 'open');
}

/**
 * Archive admission path (closed → archived)
 */
export async function archivePath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	pathId: string
): Promise<AdmissionPath> {
	return await transitionStatus(db, tenantId, pathId, 'archived');
}
