import { describe, it, expect } from 'vitest';
import { hasPermission, getPermissionsForRole, PERMISSIONS } from '$lib/server/auth/permissions';
import type { UserRole } from '$lib/server/auth/permissions';

describe('permissions', () => {
	describe('PERMISSIONS constant', () => {
		it('defines all required tenant management permissions', () => {
			expect(PERMISSIONS.TENANT_CREATE).toBe('tenant:create');
			expect(PERMISSIONS.TENANT_UPDATE).toBe('tenant:update');
			expect(PERMISSIONS.TENANT_DELETE).toBe('tenant:delete');
			expect(PERMISSIONS.TENANT_READ_ALL).toBe('tenant:read:all');
		});

		it('defines all required admission path permissions', () => {
			expect(PERMISSIONS.ADMISSION_PATHS_READ).toBe('admission_paths:read');
			expect(PERMISSIONS.ADMISSION_PATHS_CREATE).toBe('admission_paths:create');
			expect(PERMISSIONS.ADMISSION_PATHS_UPDATE).toBe('admission_paths:update');
			expect(PERMISSIONS.ADMISSION_PATHS_DELETE).toBe('admission_paths:delete');
			expect(PERMISSIONS.ADMISSION_PATHS_PUBLISH).toBe('admission_paths:publish');
			expect(PERMISSIONS.ADMISSION_PATHS_CLOSE).toBe('admission_paths:close');
			expect(PERMISSIONS.ADMISSION_PATHS_ARCHIVE).toBe('admission_paths:archive');
		});

		it('defines all required fee permissions', () => {
			expect(PERMISSIONS.FEES_READ).toBe('fees:read');
			expect(PERMISSIONS.FEES_CREATE).toBe('fees:create');
			expect(PERMISSIONS.FEES_UPDATE).toBe('fees:update');
			expect(PERMISSIONS.FEES_DELETE).toBe('fees:delete');
		});

		it('defines all required admin user management permissions', () => {
			expect(PERMISSIONS.ADMIN_USERS_READ).toBe('admin_users:read');
			expect(PERMISSIONS.ADMIN_USERS_CREATE).toBe('admin_users:create');
			expect(PERMISSIONS.ADMIN_USERS_ASSIGN_ROLE).toBe('admin_users:assign_role');
			expect(PERMISSIONS.ADMIN_USERS_REVOKE_ACCESS).toBe('admin_users:revoke_access');
		});

		it('defines all required application permissions', () => {
			expect(PERMISSIONS.APPLICATIONS_READ).toBe('applications:read');
			expect(PERMISSIONS.APPLICATIONS_VERIFY).toBe('applications:verify');
			expect(PERMISSIONS.APPLICATIONS_REJECT).toBe('applications:reject');
		});

		it('defines all required scoring permissions', () => {
			expect(PERMISSIONS.SCORES_INPUT).toBe('scores:input');
			expect(PERMISSIONS.SCORES_UPDATE).toBe('scores:update');
		});

		it('defines all required payment permissions', () => {
			expect(PERMISSIONS.PAYMENTS_READ).toBe('payments:read');
			expect(PERMISSIONS.PAYMENTS_VERIFY_MANUAL).toBe('payments:verify_manual');
			expect(PERMISSIONS.PAYMENTS_MANAGE).toBe('payments:manage');
		});

		it('defines all required report permissions', () => {
			expect(PERMISSIONS.REPORTS_READ).toBe('reports:read');
			expect(PERMISSIONS.REPORTS_EXPORT).toBe('reports:export');
		});
	});

	describe('getPermissionsForRole', () => {
		it('returns all permissions for super_admin', () => {
			const permissions = getPermissionsForRole('super_admin');

			expect(permissions).toContain(PERMISSIONS.TENANT_CREATE);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_READ);
			expect(permissions).toContain(PERMISSIONS.FEES_CREATE);
			expect(permissions).toContain(PERMISSIONS.ADMIN_USERS_ASSIGN_ROLE);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_VERIFY);
			expect(permissions).toContain(PERMISSIONS.SCORES_INPUT);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_MANAGE);
			expect(permissions).toContain(PERMISSIONS.REPORTS_READ);
		});

		it('returns tenant-scoped permissions for school_admin', () => {
			const permissions = getPermissionsForRole('school_admin');

			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_READ);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_CREATE);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_UPDATE);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_DELETE);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_PUBLISH);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_CLOSE);
			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_ARCHIVE);

			expect(permissions).toContain(PERMISSIONS.FEES_READ);
			expect(permissions).toContain(PERMISSIONS.FEES_CREATE);
			expect(permissions).toContain(PERMISSIONS.FEES_UPDATE);
			expect(permissions).toContain(PERMISSIONS.FEES_DELETE);

			expect(permissions).toContain(PERMISSIONS.ADMIN_USERS_READ);
			expect(permissions).toContain(PERMISSIONS.ADMIN_USERS_CREATE);
			expect(permissions).toContain(PERMISSIONS.ADMIN_USERS_ASSIGN_ROLE);
			expect(permissions).toContain(PERMISSIONS.ADMIN_USERS_REVOKE_ACCESS);

			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_READ);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_VERIFY);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_REJECT);

			expect(permissions).toContain(PERMISSIONS.SCORES_INPUT);
			expect(permissions).toContain(PERMISSIONS.SCORES_UPDATE);

			expect(permissions).toContain(PERMISSIONS.PAYMENTS_READ);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_VERIFY_MANUAL);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_MANAGE);

			expect(permissions).toContain(PERMISSIONS.REPORTS_READ);
			expect(permissions).toContain(PERMISSIONS.REPORTS_EXPORT);
		});

		it('does not give school_admin tenant management permissions', () => {
			const permissions = getPermissionsForRole('school_admin');

			expect(permissions).not.toContain(PERMISSIONS.TENANT_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.TENANT_UPDATE);
			expect(permissions).not.toContain(PERMISSIONS.TENANT_DELETE);
			expect(permissions).not.toContain(PERMISSIONS.TENANT_READ_ALL);
		});

		it('returns verification and scoring permissions for verifier', () => {
			const permissions = getPermissionsForRole('verifier');

			expect(permissions).toContain(PERMISSIONS.ADMISSION_PATHS_READ);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_READ);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_VERIFY);
			expect(permissions).toContain(PERMISSIONS.APPLICATIONS_REJECT);
			expect(permissions).toContain(PERMISSIONS.SCORES_INPUT);
			expect(permissions).toContain(PERMISSIONS.SCORES_UPDATE);
			expect(permissions).toContain(PERMISSIONS.REPORTS_READ);
		});

		it('does not give verifier admission path management permissions', () => {
			const permissions = getPermissionsForRole('verifier');

			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_UPDATE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_DELETE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_PUBLISH);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_CLOSE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_ARCHIVE);
		});

		it('does not give verifier fee management permissions', () => {
			const permissions = getPermissionsForRole('verifier');

			expect(permissions).not.toContain(PERMISSIONS.FEES_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.FEES_UPDATE);
			expect(permissions).not.toContain(PERMISSIONS.FEES_DELETE);
		});

		it('returns financial permissions for treasurer', () => {
			const permissions = getPermissionsForRole('treasurer');

			expect(permissions).toContain(PERMISSIONS.FEES_READ);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_READ);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_VERIFY_MANUAL);
			expect(permissions).toContain(PERMISSIONS.PAYMENTS_MANAGE);
			expect(permissions).toContain(PERMISSIONS.REPORTS_READ);
			expect(permissions).toContain(PERMISSIONS.REPORTS_EXPORT);
		});

		it('does not give treasurer admission path management permissions', () => {
			const permissions = getPermissionsForRole('treasurer');

			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_UPDATE);
			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_DELETE);
		});

		it('does not give treasurer verification permissions', () => {
			const permissions = getPermissionsForRole('treasurer');

			expect(permissions).not.toContain(PERMISSIONS.APPLICATIONS_VERIFY);
			expect(permissions).not.toContain(PERMISSIONS.APPLICATIONS_REJECT);
			expect(permissions).not.toContain(PERMISSIONS.SCORES_INPUT);
			expect(permissions).not.toContain(PERMISSIONS.SCORES_UPDATE);
		});

		it('returns minimal permissions for parent', () => {
			const permissions = getPermissionsForRole('parent');

			expect(permissions).toContain(PERMISSIONS.REPORTS_READ);
		});

		it('does not give parent any management permissions', () => {
			const permissions = getPermissionsForRole('parent');

			expect(permissions).not.toContain(PERMISSIONS.ADMISSION_PATHS_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.FEES_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.ADMIN_USERS_CREATE);
			expect(permissions).not.toContain(PERMISSIONS.APPLICATIONS_VERIFY);
			expect(permissions).not.toContain(PERMISSIONS.PAYMENTS_MANAGE);
		});
	});

	describe('hasPermission', () => {
		it('returns true when role has the permission', () => {
			expect(hasPermission('super_admin', PERMISSIONS.ADMISSION_PATHS_CREATE)).toBe(true);
			expect(hasPermission('school_admin', PERMISSIONS.ADMISSION_PATHS_CREATE)).toBe(true);
			expect(hasPermission('verifier', PERMISSIONS.APPLICATIONS_VERIFY)).toBe(true);
			expect(hasPermission('treasurer', PERMISSIONS.PAYMENTS_MANAGE)).toBe(true);
			expect(hasPermission('parent', PERMISSIONS.REPORTS_READ)).toBe(true);
		});

		it('returns false when role does not have the permission', () => {
			expect(hasPermission('parent', PERMISSIONS.ADMISSION_PATHS_CREATE)).toBe(false);
			expect(hasPermission('verifier', PERMISSIONS.FEES_CREATE)).toBe(false);
			expect(hasPermission('treasurer', PERMISSIONS.APPLICATIONS_VERIFY)).toBe(false);
			expect(hasPermission('school_admin', PERMISSIONS.TENANT_CREATE)).toBe(false);
		});

		it('returns true for super_admin for any permission', () => {
			expect(hasPermission('super_admin', PERMISSIONS.TENANT_CREATE)).toBe(true);
			expect(hasPermission('super_admin', PERMISSIONS.ADMISSION_PATHS_ARCHIVE)).toBe(true);
			expect(hasPermission('super_admin', PERMISSIONS.FEES_DELETE)).toBe(true);
			expect(hasPermission('super_admin', PERMISSIONS.ADMIN_USERS_ASSIGN_ROLE)).toBe(true);
		});

		it('verifies school_admin can archive admission paths', () => {
			expect(hasPermission('school_admin', PERMISSIONS.ADMISSION_PATHS_ARCHIVE)).toBe(true);
		});

		it('verifies verifier cannot archive admission paths', () => {
			expect(hasPermission('verifier', PERMISSIONS.ADMISSION_PATHS_ARCHIVE)).toBe(false);
		});
	});
});
