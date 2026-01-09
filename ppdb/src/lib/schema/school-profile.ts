import { z } from 'zod';

/**
 * School Profile Update Schema
 * Used for validating school profile update requests
 * Progressive enhancement: includes both core and future fields
 */
export const schoolProfileUpdateSchema = z.object({
	// Core fields (MVP)
	name: z.string().min(1, 'School name is required').max(255, 'Name too long'),
	description: z.string().max(1000, 'Description too long').optional().nullable(),
	contactEmail: z.string().email('Invalid email').optional().nullable(),
	contactPhone: z
		.string()
		.regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number')
		.optional()
		.nullable(),
	logoUrl: z.string().url('Invalid logo URL').optional().nullable(),

	// Progressive enhancement fields (future)
	bannerUrl: z.string().url('Invalid banner URL').optional().nullable(),
	primaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
		.optional()
		.nullable(),
	secondaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
		.optional()
		.nullable(),
	address: z.string().max(500, 'Address too long').optional().nullable()
});

export type SchoolProfileUpdate = z.infer<typeof schoolProfileUpdateSchema>;
