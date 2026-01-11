import { z } from 'zod';

export const fieldOptionSchema = z.object({
	label: z.string().min(1),
	value: z.string().min(1),
	order: z.number().int().default(0)
});

export const customFieldSchema = z.object({
	label: z.string().min(1),
	key: z
		.string()
		.min(1)
		.regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
	fieldType: z.enum([
		'text',
		'textarea',
		'number',
		'email',
		'tel',
		'date',
		'select',
		'checkbox',
		'radio',
		'file'
	]),
	step: z.number().int().min(1).default(1),
	required: z.boolean().default(false),
	placeholder: z.string().optional().nullable(),
	helpText: z.string().optional().nullable(),
	order: z.number().int().default(0),
	options: z.array(fieldOptionSchema).optional()
});
