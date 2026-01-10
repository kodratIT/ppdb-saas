import { eq, and } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import {
	feeStructureCreateSchema,
	feeStructureUpdateSchema,
	type PaymentTiming
} from '../../../schema/fee-structure';

export type FeeStructure = typeof schema.feeStructures.$inferSelect;
export type NewFeeStructure = typeof schema.feeStructures.$inferInsert;

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
 * List all fee structures for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @returns Array of fee structures
 */
export async function listFeeStructures(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string
): Promise<FeeStructure[]> {
	return await db
		.select()
		.from(schema.feeStructures)
		.where(eq(schema.feeStructures.tenantId, tenantId));
}

/**
 * List fee structures for a specific admission path
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param admissionPathId - Admission path ID
 * @returns Array of fee structures for the admission path
 */
export async function listFeeStructuresByAdmissionPath(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	admissionPathId: string
): Promise<FeeStructure[]> {
	return await db
		.select()
		.from(schema.feeStructures)
		.where(
			and(
				eq(schema.feeStructures.tenantId, tenantId),
				eq(schema.feeStructures.admissionPathId, admissionPathId)
			)
		);
}

/**
 * Get fee structure by ID for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param feeId - Fee structure ID
 * @returns Fee structure or null if not found
 */
export async function getFeeStructureById(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	feeId: string
): Promise<FeeStructure | null> {
	const results = await db
		.select()
		.from(schema.feeStructures)
		.where(and(eq(schema.feeStructures.id, feeId), eq(schema.feeStructures.tenantId, tenantId)));

	return results[0] || null;
}

/**
 * Create new fee structure
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param data - Fee structure data
 * @returns Created fee structure
 */
export async function createFeeStructure(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	data: any
): Promise<FeeStructure> {
	// Validate input
	const validatedData = feeStructureCreateSchema.parse(data);

	const created = await db
		.insert(schema.feeStructures)
		.values({
			tenantId,
			admissionPathId: validatedData.admissionPathId,
			name: validatedData.name,
			description: validatedData.description || null,
			amount: validatedData.amount,
			currency: validatedData.currency,
			paymentTiming: validatedData.paymentTiming,
			dueDateOffsetDays: validatedData.dueDateOffsetDays || 0,
			penaltyAmount: validatedData.penaltyAmount || null,
			penaltyGraceDays: validatedData.penaltyGraceDays || null,
			status: validatedData.status || 'active'
		})
		.returning();

	return created[0];
}

/**
 * Update fee structure
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param feeId - Fee structure ID
 * @param data - Update data
 * @returns Updated fee structure
 */
export async function updateFeeStructure(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	feeId: string,
	data: any
): Promise<FeeStructure> {
	// Validate input
	const validatedData = feeStructureUpdateSchema.parse(data);

	// Check if fee exists
	const existingFee = await getFeeStructureById(db, tenantId, feeId);
	if (!existingFee) {
		throw new BusinessRuleError('Fee structure not found');
	}

	const updated = await db
		.update(schema.feeStructures)
		.set({
			...validatedData,
			updatedAt: new Date()
		})
		.where(and(eq(schema.feeStructures.id, feeId), eq(schema.feeStructures.tenantId, tenantId)))
		.returning();

	if (updated.length === 0) {
		throw new BusinessRuleError('Fee structure not found');
	}

	return updated[0];
}

/**
 * Delete fee structure
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param feeId - Fee structure ID
 */
export async function deleteFeeStructure(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	feeId: string
): Promise<void> {
	// Check if fee exists
	const existingFee = await getFeeStructureById(db, tenantId, feeId);
	if (!existingFee) {
		throw new BusinessRuleError('Fee structure not found');
	}

	await db
		.delete(schema.feeStructures)
		.where(and(eq(schema.feeStructures.id, feeId), eq(schema.feeStructures.tenantId, tenantId)));
}

/**
 * Calculate due date based on registration date and offset days
 * @param registrationDate - Date when registration was submitted
 * @param offsetDays - Number of days from registration
 * @returns Due date
 */
export function calculateDueDate(registrationDate: Date, offsetDays: number): Date {
	const dueDate = new Date(registrationDate);
	dueDate.setDate(dueDate.getDate() + offsetDays);
	return dueDate;
}

/**
 * Check if a payment is overdue
 * @param dueDate - Payment due date
 * @returns True if overdue
 */
export function isOverdue(dueDate: Date): boolean {
	return new Date() > dueDate;
}

/**
 * Calculate penalty amount if applicable
 * @param dueDate - Payment due date
 * @param penaltyAmount - Penalty amount to apply
 * @param graceDays - Grace period in days
 * @returns Penalty amount (0 if not applicable)
 */
export function calculatePenalty(
	dueDate: Date,
	penaltyAmount: number | null,
	graceDays: number | null
): number {
	if (!penaltyAmount || penaltyAmount <= 0) {
		return 0;
	}

	const gracePeriod = graceDays ?? 0;
	const graceEndDate = new Date(dueDate);
	graceEndDate.setDate(graceEndDate.getDate() + gracePeriod);

	if (new Date() > graceEndDate) {
		return penaltyAmount;
	}

	return 0;
}

/**
 * Validate currency code
 * @param currency - Currency code to validate
 * @returns True if valid
 */
export function isValidCurrency(currency: string): boolean {
	const validCurrencies = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'];
	return validCurrencies.includes(currency);
}

/**
 * Get human-readable payment timing description
 * @param timing - Payment timing enum value
 * @returns Human-readable description
 */
export function getPaymentTimingDescription(timing: PaymentTiming): string {
	const descriptions: Record<PaymentTiming, string> = {
		registration: 'Due upon registration',
		acceptance: 'Due upon acceptance',
		enrollment: 'Due upon enrollment',
		custom: 'Custom timing'
	};
	return descriptions[timing];
}
