import { z } from 'zod';

/**
 * Payment Timing Enum
 * When the fee should be paid
 */
export const paymentTimingEnum = z.enum(['registration', 'acceptance', 'enrollment', 'custom']);
export type PaymentTiming = z.infer<typeof paymentTimingEnum>;

/**
 * Fee Status Enum
 */
export const feeStatusEnum = z.enum(['active', 'inactive']);
export type FeeStatus = z.infer<typeof feeStatusEnum>;

/**
 * Supported Currencies (ISO 4217)
 */
export const supportedCurrencies = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'] as const;
export type SupportedCurrency = (typeof supportedCurrencies)[number];

/**
 * Fee Structure Create Schema
 * Used when creating a new fee structure
 */
export const feeStructureCreateSchema = z.object({
	admissionPathId: z.string().uuid('Invalid admission path ID'),
	name: z.string().min(1, 'Fee name is required').max(255, 'Name is too long').trim(),
	description: z.string().max(1000, 'Description is too long').optional().nullable(),
	amount: z.number().int('Amount must be an integer').positive('Amount must be greater than 0'),
	currency: z.enum(supportedCurrencies).default('IDR'),
	paymentTiming: paymentTimingEnum.default('registration'),
	dueDateOffsetDays: z.number().int().min(0, 'Offset days cannot be negative').default(0),
	penaltyAmount: z.number().int().positive('Penalty amount must be positive').nullable().optional(),
	penaltyGraceDays: z.number().int().min(0, 'Grace days cannot be negative').nullable().optional(),
	status: feeStatusEnum.default('active')
});

export type FeeStructureCreate = z.infer<typeof feeStructureCreateSchema>;

/**
 * Fee Structure Update Schema
 * All fields optional for partial updates
 */
export const feeStructureUpdateSchema = z.object({
	admissionPathId: z.string().uuid('Invalid admission path ID').optional(),
	name: z.string().min(1, 'Name cannot be empty').max(255, 'Name is too long').trim().optional(),
	description: z.string().max(1000, 'Description is too long').optional().nullable(),
	amount: z
		.number()
		.int('Amount must be an integer')
		.positive('Amount must be greater than 0')
		.optional(),
	currency: z.enum(supportedCurrencies).optional(),
	paymentTiming: paymentTimingEnum.optional(),
	dueDateOffsetDays: z.number().int().min(0, 'Offset days cannot be negative').optional(),
	penaltyAmount: z.number().int().positive('Penalty amount must be positive').nullable().optional(),
	penaltyGraceDays: z.number().int().min(0, 'Grace days cannot be negative').nullable().optional(),
	status: feeStatusEnum.optional()
});

export type FeeStructureUpdate = z.infer<typeof feeStructureUpdateSchema>;

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
	return supportedCurrencies.includes(currency as SupportedCurrency);
}

/**
 * Format amount for display (e.g., 1500000 -> Rp 1.500.000)
 */
export function formatCurrency(amount: number, currency: SupportedCurrency = 'IDR'): string {
	const formatter = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
	return formatter.format(amount);
}
