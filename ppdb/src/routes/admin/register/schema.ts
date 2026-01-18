import { z } from 'zod';

// Regex for slug: lowercase letters, numbers, and hyphens only
const slugRegex = /^[a-z0-9-]+$/;

// Identity Step Schema
export const identitySchema = z.object({
	name: z.string().min(3, 'School name must be at least 3 characters'),
	npsn: z
		.string()
		.length(8, 'NPSN must be exactly 8 digits')
		.regex(/^\d+$/, 'NPSN must differ only of numbers'),
	slug: z
		.string()
		.min(3, 'Slug must be at least 3 characters')
		.regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens'),
	level: z.enum(['SD', 'SMP', 'SMA', 'SMK', 'Universitas', 'Lainnya']),
	status: z.enum(['negeri', 'swasta']).default('negeri')
});

// Location Step Schema
export const locationSchema = z.object({
	province: z.string().min(1, 'Province is required'),
	city: z.string().min(1, 'City is required'),
	district: z.string().min(1, 'District is required'),
	village: z.string().min(1, 'Village is required'),
	address: z.string().min(10, 'Address must be at least 10 characters'),
	postalCode: z
		.string()
		.length(5, 'Postal code must be 5 digits')
		.regex(/^\d+$/, 'Postal code must contain only numbers')
});

// Admin Step Schema
export const adminSchema = z.object({
	adminName: z.string().min(3, 'Admin name must be at least 3 characters'),
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	whatsapp: z
		.string()
		.min(10, 'WhatsApp number must be at least 10 characters')
		.regex(/^\+?[\d\s-]+$/, 'Invalid phone number format')
});

// Combined Schema for final submission (optional, but good for type inference)
export const registrationSchema = z.object({
	...identitySchema.shape,
	...locationSchema.shape,
	...adminSchema.shape
});

export type IdentityFormData = z.infer<typeof identitySchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type AdminFormData = z.infer<typeof adminSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
