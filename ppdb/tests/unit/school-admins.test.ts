import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as schoolAdminsDomain from '../../src/lib/server/domain/school-admins';
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

describe('School Admins Domain Logic', () => {
	let mockDb: NeonHttpDatabase<typeof schema>;

	beforeEach(() => {
		mockDb = createMockDb();
		vi.clearAllMocks();
	});

	describe('listSchoolAdmins', () => {
		it('should return all users with admin+ roles for a tenant', async () => {
			const tenantId = 'tenant-123';
			const mockAdmins = [
				{
					id: 'user-1',
					email: 'admin1@school.com',
					tenantId,
					role: 'school_admin' as const,
					name: 'Admin Satu',
					status: 'active' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'user-2',
					email: 'verifier@school.com',
					tenantId,
					role: 'verifier' as const,
					name: 'Verifier Staff',
					status: 'active' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(mockAdmins)
				})
			} as any);

			const result = await schoolAdminsDomain.listSchoolAdmins(mockDb, tenantId);

			expect(result).toEqual(mockAdmins);
			expect(result).toHaveLength(2);
		});

		it('should return empty array when no admins exist', async () => {
			const tenantId = 'tenant-empty';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await schoolAdminsDomain.listSchoolAdmins(mockDb, tenantId);

			expect(result).toEqual([]);
		});
	});

	describe('createSchoolAdmin', () => {
		it('should create new school admin with school_admin role', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const createData = {
				email: 'newadmin@school.com',
				name: 'New Admin',
				role: 'school_admin' as const
			};

			const createdUser = {
				id: '550e8400-e29b-41d4-a716-446655440001',
				tenantId,
				...createData,
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([createdUser])
				})
			} as any);

			const result = await schoolAdminsDomain.createSchoolAdmin(mockDb, tenantId, createData);

			expect(result).toEqual(createdUser);
			expect(result.role).toBe('school_admin');
			expect(result.status).toBe('active');
		});

		it('should throw error when creating with invalid email', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const invalidData = {
				email: 'invalid-email', // Invalid email format
				name: 'Test User',
				role: 'school_admin' as const
			};

			await expect(
				schoolAdminsDomain.createSchoolAdmin(mockDb, tenantId, invalidData)
			).rejects.toThrow();
		});

		it('should throw error when creating with invalid role', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const invalidData = {
				email: 'test@school.com',
				name: 'Test User',
				role: 'invalid_role' as const // Invalid role
			};

			await expect(
				schoolAdminsDomain.createSchoolAdmin(mockDb, tenantId, invalidData)
			).rejects.toThrow();
		});
	});

	describe('assignRoleToUser', () => {
		it('should assign verifier role to existing user', async () => {
			const tenantId = 'tenant-123';
			const userId = 'user-1';
			const newRole = 'verifier' as const;

			const existingUser = {
				id: userId,
				email: 'staff@school.com',
				tenantId,
				role: 'school_admin' as const,
				name: 'Staff User',
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const updatedUser = {
				...existingUser,
				role: newRole
			};

			// Mock getting current user
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([existingUser])
				})
			} as any);

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedUser])
					})
				})
			} as any);

			const result = await schoolAdminsDomain.assignRoleToUser(mockDb, tenantId, userId, newRole);

			expect(result).toEqual(updatedUser);
			expect(result.role).toBe('verifier');
		});

		it('should throw error when user does not exist', async () => {
			const tenantId = 'tenant-123';
			const userId = 'non-existent';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			await expect(
				schoolAdminsDomain.assignRoleToUser(mockDb, tenantId, userId, 'verifier' as const)
			).rejects.toThrow('User not found');
		});
	});

	describe('revokeAccess', () => {
		it('should deactivate user access', async () => {
			const tenantId = '550e8400-e29b-41d4-a716-446655440000';
			const userId = '550e8400-e29b-41d4-a716-446655440001';

			const mockUser = {
				id: userId,
				email: 'admin@school.com',
				tenantId,
				role: 'school_admin' as const,
				name: 'Admin User',
				status: 'active' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const deactivatedUser = {
				...mockUser,
				status: 'inactive' as const
			};

			// Mock getting current user
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockUser])
				})
			} as any);

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([deactivatedUser])
					})
				})
			} as any);

			const result = await schoolAdminsDomain.revokeAccess(mockDb, tenantId, userId);

			expect(result).toEqual(deactivatedUser);
			expect(result.status).toBe('inactive');
		});
	});

	describe('checkPermissions', () => {
		it('should allow school admin to access settings for their tenant', () => {
			const userRole = 'school_admin' as const;
			const userTenantId = 'tenant-123';
			const targetTenantId = 'tenant-123';
			const requiredPermissions = ['access_settings'] as any;

			const result = schoolAdminsDomain.checkPermissions(
				userRole,
				userTenantId,
				targetTenantId,
				requiredPermissions
			);

			expect(result).toBe(true);
		});

		it('should deny school admin accessing other tenant', () => {
			const userRole = 'school_admin' as const;
			const userTenantId = 'tenant-123';
			const targetTenantId = 'tenant-456'; // Different tenant
			const requiredPermissions = ['access_settings'] as any;

			const result = schoolAdminsDomain.checkPermissions(
				userRole,
				userTenantId,
				targetTenantId,
				requiredPermissions
			);

			expect(result).toBe(false);
		});

		it('should deny verifier accessing settings', () => {
			const userRole = 'verifier' as const;
			const userTenantId = 'tenant-123';
			const targetTenantId = 'tenant-123';
			const requiredPermissions = ['access_settings'] as any;

			const result = schoolAdminsDomain.checkPermissions(
				userRole,
				userTenantId,
				targetTenantId,
				requiredPermissions
			);

			expect(result).toBe(false);
		});

		it('should allow super admin to access any tenant', () => {
			const userRole = 'super_admin' as const;
			const userTenantId = 'super-admin-tenant'; // Special tenant
			const targetTenantId = 'tenant-456';
			const requiredPermissions = ['access_settings'] as any;

			const result = schoolAdminsDomain.checkPermissions(
				userRole,
				userTenantId,
				targetTenantId,
				requiredPermissions
			);

			expect(result).toBe(true);
		});

		it('should allow verifier to access verification', () => {
			const userRole = 'verifier' as const;
			const userTenantId = 'tenant-123';
			const targetTenantId = 'tenant-123';
			const requiredPermissions = ['access_verification'] as any;

			const result = schoolAdminsDomain.checkPermissions(
				userRole,
				userTenantId,
				targetTenantId,
				requiredPermissions
			);

			expect(result).toBe(true);
		});
	});

	describe('getAllowedPermissionsForRole', () => {
		it('should return correct permissions for school_admin', () => {
			const permissions = schoolAdminsDomain.getAllowedPermissionsForRole('school_admin' as const);

			expect(permissions).toContain('access_settings');
			expect(permissions).toContain('manage_school_admins');
			expect(permissions).toContain('access_verification');
			expect(permissions).toContain('access_finance');
		});

		it('should return correct permissions for verifier', () => {
			const permissions = schoolAdminsDomain.getAllowedPermissionsForRole('verifier' as const);

			expect(permissions).toContain('access_verification');
			expect(permissions).not.toContain('access_settings');
			expect(permissions).not.toContain('manage_school_admins');
		});

		it('should return all permissions for super_admin', () => {
			const permissions = schoolAdminsDomain.getAllowedPermissionsForRole('super_admin' as const);

			expect(permissions.length).toBeGreaterThan(0);
			expect(permissions).toContain('access_settings');
			expect(permissions).toContain('manage_all_tenants');
		});
	});
});
