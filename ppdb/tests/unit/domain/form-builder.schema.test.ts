import { describe, it, expect } from 'vitest';
import { customFieldSchema } from '../../../src/lib/server/domain/form-builder.schema';

describe('Form Builder Schema', () => {
	it('should validate valid field data', () => {
		const validData = {
			label: 'Nama Ayah',
			key: 'father_name',
			fieldType: 'text',
			step: 1,
			required: true
		};

		const result = customFieldSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('should reject invalid key format', () => {
		const invalidData = {
			label: 'Nama Ayah',
			key: 'Father Name', // Spaces and uppercase
			fieldType: 'text'
		};

		const result = customFieldSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const issues = result.error.issues;
			expect(issues[0].message).toBe('Key must be lowercase alphanumeric with underscores');
		}
	});

	it('should validate field with options', () => {
		const validData = {
			label: 'Hobi',
			key: 'hobby',
			fieldType: 'checkbox',
			options: [
				{ label: 'Membaca', value: 'reading', order: 1 },
				{ label: 'Menulis', value: 'writing', order: 2 }
			]
		};

		const result = customFieldSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});
