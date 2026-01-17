/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as formBuilderDomain from '../../../src/lib/server/domain/form-builder';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../../src/lib/server/db/schema';

const createMockDb = () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		transaction: vi.fn().mockImplementation((callback) => callback(mockDb)),
		query: {
			customFields: {
				findMany: vi.fn()
			}
		}
	};
	return mockDb as unknown as NeonHttpDatabase<typeof schema>;
};

describe('Form Builder Domain Logic', () => {
	let mockDb: NeonHttpDatabase<typeof schema>;

	beforeEach(() => {
		mockDb = createMockDb();
		vi.clearAllMocks();
	});

	describe('listFields', () => {
		it('should return all fields for an admission path', async () => {
			const tenantId = 'tenant-123';
			const admissionPathId = 'path-123';
			const mockFields = [
				{
					id: 'field-1',
					label: 'Nama Lengkap',
					key: 'full_name',
					fieldType: 'text',
					options: []
				}
			];

			vi.spyOn(mockDb.query.customFields, 'findMany').mockResolvedValue(mockFields as any);

			const result = await formBuilderDomain.listFields(mockDb, tenantId, admissionPathId);

			expect(result).toEqual(mockFields);
		});
	});

	describe('createField', () => {
		it('should create a field and its options', async () => {
			const tenantId = 'tenant-123';
			const admissionPathId = 'path-123';
			const fieldData = {
				label: 'Pilihan Jurusan',
				key: 'major',
				fieldType: 'select' as const,
				step: 1,
				required: true,
				options: [
					{ label: 'IPA', value: 'ipa', order: 1 },
					{ label: 'IPS', value: 'ips', order: 2 }
				]
			};

			const mockCreatedField = { id: 'field-1', ...fieldData, tenantId, admissionPathId };
			// @ts-expect-error - Deleting property from mock object for testing
			delete mockCreatedField.options;

			vi.spyOn(mockDb, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockCreatedField])
				})
			} as any);

			const result = await formBuilderDomain.createField(
				mockDb,
				tenantId,
				admissionPathId,
				fieldData
			);

			expect(result).toEqual(mockCreatedField);
			expect(mockDb.insert).toHaveBeenCalledTimes(2); // Once for field, once for options
		});
	});

	describe('updateField', () => {
		it('should update a field and replace its options', async () => {
			const tenantId = 'tenant-123';
			const fieldId = 'field-1';
			const updateData = {
				label: 'Updated Label',
				options: [{ label: 'New Opt', value: 'new', order: 1 }]
			};

			const mockUpdatedField = { id: fieldId, ...updateData, tenantId };
			// @ts-expect-error - deleting property from mock object
			delete mockUpdatedField.options;

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([mockUpdatedField])
					})
				})
			} as any);

			const result = await formBuilderDomain.updateField(mockDb, tenantId, fieldId, updateData);

			expect(result).toEqual(mockUpdatedField);
			expect(mockDb.delete).toHaveBeenCalled(); // Should delete old options
			expect(mockDb.insert).toHaveBeenCalled(); // Should insert new options
		});
	});

	describe('deleteField', () => {
		it('should delete a field', async () => {
			const tenantId = 'tenant-123';
			const fieldId = 'field-1';

			vi.spyOn(mockDb, 'delete').mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined)
			} as any);

			await formBuilderDomain.deleteField(mockDb, tenantId, fieldId);

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
