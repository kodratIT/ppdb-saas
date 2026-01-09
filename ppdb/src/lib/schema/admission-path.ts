import { z } from 'zod';

/**
 * Admission Path Status Enum
 * Lifecycle: draft → open → closed → archived
 */
export const admissionPathStatusEnum = z.enum(['draft', 'open', 'closed', 'archived']);
export type AdmissionPathStatus = z.infer<typeof admissionPathStatusEnum>;

/**
 * Valid state transitions for admission path lifecycle
 */
export const validTransitions: Record<AdmissionPathStatus, AdmissionPathStatus[]> = {
	draft: ['open'],
	open: ['closed'],
	closed: ['open', 'archived'],
	archived: []
};

/**
 * Admission Path Create Schema
 * Used when creating a new admission path
 */
export const admissionPathCreateSchema = z.object({
	name: z.string().min(1, 'Admission path name is required').max(255, 'Name is too long').trim(),
	description: z.string().max(1000, 'Description is too long').optional().nullable(),
	quota: z
		.number()
		.int('Quota must be an integer')
		.positive('Quota must be greater than 0')
		.max(10000, 'Quota cannot exceed 10,000'),
	status: admissionPathStatusEnum.default('draft')
});

export type AdmissionPathCreate = z.infer<typeof admissionPathCreateSchema>;

/**
 * Admission Path Update Schema
 * All fields optional for partial updates
 */
export const admissionPathUpdateSchema = z.object({
	name: z.string().min(1, 'Name cannot be empty').max(255, 'Name is too long').trim().optional(),
	description: z.string().max(1000, 'Description is too long').optional().nullable(),
	quota: z
		.number()
		.int('Quota must be an integer')
		.positive('Quota must be greater than 0')
		.max(10000, 'Quota cannot exceed 10,000')
		.optional()
});

export type AdmissionPathUpdate = z.infer<typeof admissionPathUpdateSchema>;

/**
 * Status Transition Schema
 * Validates state transitions
 */
export const statusTransitionSchema = z.object({
	from: admissionPathStatusEnum,
	to: admissionPathStatusEnum
});

/**
 * Validate if a status transition is allowed
 */
export function isValidTransition(from: AdmissionPathStatus, to: AdmissionPathStatus): boolean {
	return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Business rule: Validate quota against filled slots
 */
export function validateQuotaUpdate(newQuota: number, filledSlots: number): boolean {
	return newQuota >= filledSlots;
}
