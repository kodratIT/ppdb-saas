/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as schoolProfileDomain from '../../src/lib/server/domain/school-profile';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../src/lib/server/db/schema';

// Mock database
const createMockDb = () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis()
	};
	return mockDb as unknown as NeonHttpDatabase<typeof schema>;
};

describe('School Profile Domain Logic', () => {
	let mockDb: NeonHttpDatabase<typeof schema>;

	beforeEach(() => {
		mockDb = createMockDb();
		vi.clearAllMocks();
	});

	describe('getSchoolProfileByTenantId', () => {
		it('should return school profile for valid tenant', async () => {
			const tenantId = 'test-tenant-123';
			const mockProfile = {
				id: 'profile-123',
				tenantId,
				name: 'Test School',
				description: 'A test school',
				contactEmail: 'test@school.com',
				contactPhone: '08123456789',
				logoUrl: null,
				bannerUrl: null,
				primaryColor: null,
				secondaryColor: null,
				address: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockProfile])
				})
			} as any);

			const result = await schoolProfileDomain.getSchoolProfileByTenantId(mockDb, tenantId);

			expect(result).toEqual(mockProfile);
		});

		it('should return null when profile does not exist', async () => {
			const tenantId = 'non-existent-tenant';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await schoolProfileDomain.getSchoolProfileByTenantId(mockDb, tenantId);

			expect(result).toBeNull();
		});
	});

	describe('updateSchoolProfile', () => {
		it('should update existing profile with new data', async () => {
			const tenantId = 'test-tenant-123';
			const updateData = {
				name: 'Updated School Name',
				description: 'Updated description',
				contactEmail: 'updated@school.com',
				logoUrl: 'https://example.com/logo.png'
			};

			const updatedProfile = {
				id: 'profile-123',
				tenantId,
				...updateData,
				contactPhone: '08123456789',
				bannerUrl: null,
				primaryColor: null,
				secondaryColor: null,
				address: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedProfile])
					})
				})
			} as any);

			const result = await schoolProfileDomain.updateSchoolProfile(mockDb, tenantId, updateData);

			expect(result).toEqual(updatedProfile);
			expect(result.name).toBe('Updated School Name');
		});

		it('should create profile if it does not exist', async () => {
			const tenantId = 'new-tenant-123';
			const createData = {
				name: 'New School',
				description: 'A brand new school'
			};

			const newProfile = {
				id: 'profile-new',
				tenantId,
				...createData,
				contactEmail: null,
				contactPhone: null,
				logoUrl: null,
				bannerUrl: null,
				primaryColor: null,
				secondaryColor: null,
				address: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock update to return empty (no existing profile)
			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([])
					})
				})
			} as any);

			// Mock insert to create new profile
			vi.spyOn(mockDb, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([newProfile])
				})
			} as any);

			const result = await schoolProfileDomain.updateSchoolProfile(mockDb, tenantId, createData);

			expect(result).toEqual(newProfile);
		});
	});
});
