/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as feeStructuresDomain from '../../src/lib/server/domain/fee-structures';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../src/lib/server/db/schema';

// Mock database
const createMockDb = () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		and: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis()
	};
	return mockDb as unknown as NeonHttpDatabase<typeof schema>;
};

describe('Fee Structures Domain Logic', () => {
	let mockDb: NeonHttpDatabase<typeof schema>;

	beforeEach(() => {
		mockDb = createMockDb();
		vi.clearAllMocks();
	});

	describe('listFeeStructures', () => {
		it('should return all fee structures for a tenant', async () => {
			const tenantId = 'tenant-123';
			const mockFees = [
				{
					id: 'fee-1',
					tenantId,
					admissionPathId: 'path-1',
					name: 'Biaya Pendaftaran',
					description: 'Biaya administrasi pendaftaran',
					amount: 150000,
					currency: 'IDR',
					paymentTiming: 'registration' as const,
					dueDateOffsetDays: 0,
					penaltyAmount: null,
					penaltyGraceDays: null,
					status: 'active' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'fee-2',
					tenantId,
					admissionPathId: 'path-1',
					name: 'Biaya Seragam',
					description: 'Seragam sekolah lengkap',
					amount: 350000,
					currency: 'IDR',
					paymentTiming: 'enrollment' as const,
					dueDateOffsetDays: 30,
					penaltyAmount: 25000,
					penaltyGraceDays: 7,
					status: 'active' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(mockFees)
				})
			} as any);

			const result = await feeStructuresDomain.listFeeStructures(mockDb, tenantId);

			expect(result).toEqual(mockFees);
			expect(result).toHaveLength(2);
		});

		it('should return empty array when no fees exist', async () => {
			const tenantId = 'tenant-empty';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await feeStructuresDomain.listFeeStructures(mockDb, tenantId);

			expect(result).toEqual([]);
		});
	});

	describe('getFeeStructureById', () => {
		it('should return fee structure by id for valid tenant', async () => {
			const tenantId = 'tenant-123';
			const feeId = 'fee-1';
			const mockFee = {
				id: feeId,
				tenantId,
				admissionPathId: 'path-1',
				name: 'Biaya Pendaftaran',
				description: 'Biaya administrasi',
				amount: 150000,
				currency: 'IDR',
				paymentTiming: 'registration' as const,
				dueDateOffsetDays: 0,
				penaltyAmount: null,
				penaltyGraceDays: null,
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockFee])
				})
			} as any);

			const result = await feeStructuresDomain.getFeeStructureById(mockDb, tenantId, feeId);

			expect(result).toEqual(mockFee);
		});

		it('should return null when fee does not exist', async () => {
			const tenantId = 'tenant-123';
			const feeId = 'non-existent';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await feeStructuresDomain.getFeeStructureById(mockDb, tenantId, feeId);

			expect(result).toBeNull();
		});
	});

	describe('createFeeStructure', () => {
		it('should create new fee structure with active status', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const admissionPathId = '550e8400-e29b-41d4-a716-446655440001';
			const createData = {
				admissionPathId,
				name: 'Biaya PPDB',
				description: 'Biaya pendaftaran',
				amount: 200000,
				currency: 'IDR',
				paymentTiming: 'registration' as const,
				dueDateOffsetDays: 0,
				status: 'active' as const
			};

			const createdFee = {
				id: '550e8400-e29b-41d4-a716-446655440002',
				tenantId,
				...createData,
				penaltyAmount: null,
				penaltyGraceDays: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([createdFee])
				})
			} as any);

			const result = await feeStructuresDomain.createFeeStructure(mockDb, tenantId, createData);

			expect(result).toEqual(createdFee);
			expect(result.status).toBe('active');
			expect(result.amount).toBe(200000);
		});

		it('should throw error when creating with invalid amount', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const admissionPathId = '550e8400-e29b-41d4-a716-446655440001';
			const invalidData = {
				admissionPathId,
				name: 'Invalid Fee',
				amount: -1000, // Invalid: negative amount
				currency: 'IDR',
				paymentTiming: 'registration' as const
			};

			await expect(
				feeStructuresDomain.createFeeStructure(mockDb, tenantId, invalidData)
			).rejects.toThrow();
		});
	});

	describe('updateFeeStructure', () => {
		it('should update fee structure fields', async () => {
			const tenantId = 'tenant-123';
			const feeId = 'fee-1';
			const updateData = {
				name: 'Updated Fee Name',
				amount: 250000
			};

			const currentFee = {
				id: feeId,
				tenantId,
				admissionPathId: 'path-1',
				name: 'Original Fee Name',
				description: 'Original description',
				amount: 200000,
				currency: 'IDR',
				paymentTiming: 'registration' as const,
				dueDateOffsetDays: 0,
				penaltyAmount: null,
				penaltyGraceDays: null,
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const updatedFee = {
				...currentFee,
				name: updateData.name,
				amount: updateData.amount
			};

			// Mock getting current fee
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([currentFee])
				})
			} as any);

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedFee])
					})
				})
			} as any);

			const result = await feeStructuresDomain.updateFeeStructure(
				mockDb,
				tenantId,
				feeId,
				updateData
			);

			expect(result).toEqual(updatedFee);
			expect(result.name).toBe('Updated Fee Name');
			expect(result.amount).toBe(250000);
		});

		it('should throw error when updating non-existent fee', async () => {
			const tenantId = 'tenant-123';
			const feeId = 'non-existent';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			await expect(
				feeStructuresDomain.updateFeeStructure(mockDb, tenantId, feeId, { name: 'Test' })
			).rejects.toThrow('Fee structure not found');
		});
	});

	describe('deleteFeeStructure', () => {
		it('should delete fee structure', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const feeId = '550e8400-e29b-41d4-a716-446655440001';

			const mockFee = {
				id: feeId,
				tenantId,
				admissionPathId: '550e8400-e29b-41d4-a716-446655440002',
				name: 'Test Fee',
				description: null,
				amount: 100000,
				currency: 'IDR',
				paymentTiming: 'registration' as const,
				dueDateOffsetDays: 0,
				penaltyAmount: null,
				penaltyGraceDays: null,
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock getting current fee
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockFee])
				})
			} as any);

			vi.spyOn(mockDb, 'delete').mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined)
			} as any);

			await feeStructuresDomain.deleteFeeStructure(mockDb, tenantId, feeId);

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});

	describe('Fee Calculation Helpers', () => {
		describe('calculateDueDate', () => {
			it('should return registration date for offset 0', () => {
				const registrationDate = new Date('2026-01-15');
				const result = feeStructuresDomain.calculateDueDate(registrationDate, 0);

				expect(result.getTime()).toBe(registrationDate.getTime());
			});

			it('should add offset days to registration date', () => {
				const registrationDate = new Date('2026-01-15');
				const result = feeStructuresDomain.calculateDueDate(registrationDate, 14);

				const expectedDate = new Date('2026-01-29');
				expect(result.getTime()).toBe(expectedDate.getTime());
			});
		});

		describe('isOverdue', () => {
			it('should return false for future due date', () => {
				const futureDate = new Date('2026-12-31');
				const result = feeStructuresDomain.isOverdue(futureDate);

				expect(result).toBe(false);
			});

			it('should return true for past due date', () => {
				const pastDate = new Date('2026-01-01');
				const result = feeStructuresDomain.isOverdue(pastDate);

				expect(result).toBe(true);
			});
		});

		describe('calculatePenalty', () => {
			it('should return 0 when not overdue', () => {
				const futureDueDate = new Date('2099-12-31');
				const penaltyAmount = 25000;
				const graceDays = 7;

				const result = feeStructuresDomain.calculatePenalty(
					futureDueDate,
					penaltyAmount,
					graceDays
				);

				expect(result).toBe(0);
			});

			it('should return penalty amount when overdue past grace period', () => {
				const pastDueDate = new Date('2026-01-01');
				const penaltyAmount = 25000;
				const graceDays = 0;

				const result = feeStructuresDomain.calculatePenalty(pastDueDate, penaltyAmount, graceDays);

				expect(result).toBe(penaltyAmount);
			});

			it('should return 0 when within grace period', () => {
				const recentDueDate = new Date();
				recentDueDate.setDate(recentDueDate.getDate() - 3);
				const penaltyAmount = 25000;
				const graceDays = 7;

				const result = feeStructuresDomain.calculatePenalty(
					recentDueDate,
					penaltyAmount,
					graceDays
				);

				expect(result).toBe(0);
			});
		});
	});

	describe('Business Rules', () => {
		it('should validate currency format', () => {
			expect(feeStructuresDomain.isValidCurrency('IDR')).toBe(true);
			expect(feeStructuresDomain.isValidCurrency('USD')).toBe(true);
			expect(feeStructuresDomain.isValidCurrency('INVALID')).toBe(false);
		});
	});
});
