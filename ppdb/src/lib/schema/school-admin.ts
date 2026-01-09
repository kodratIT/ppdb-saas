import { z } from 'zod';

/**
 * User Role Enum
 * Defines the hierarchy of user permissions in the system
 */
export const roleEnum = z.enum([
	'super_admin', // Can access all tenants and global settings
	'school_admin', // Full access to school settings for their tenant
	'verifier', // Can access verification workflow
	'treasurer', // Can access finance/payments
	'parent' // Can access parent portal
]);
export type UserRole = z.infer<typeof roleEnum>;

/**
 * User Status Enum
 * Controls user activation state
 */
export const userStatusEnum = z.enum(['active', 'inactive', 'pending']);
export type UserStatus = z.infer<typeof userStatusEnum>;

/**
 * Permission Enum
 * Granular permissions for access control
 */
export const permissionEnum = z.enum([
	'access_settings', // Access settings pages
	'manage_school_admins', // Create/assign school admins
	'access_verification', // Access verification workflow
	'access_finance', // Access finance/payment pages
	'manage_all_tenants', // Super admin only: manage all tenants
	'access_global_metrics' // Super admin only: global platform metrics
]);
export type Permission = z.infer<typeof permissionEnum>;

/**
 * School Admin Create Schema
 * Used when creating a new school admin user
 */
export const schoolAdminCreateSchema = z.object({
	email: z.string().email('Invalid email format').trim().toLowerCase(),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long').trim(),
	role: roleEnum
});

export type SchoolAdminCreate = z.infer<typeof schoolAdminCreateSchema>;

/**
 * Role Assignment Schema
 * Used when updating user role
 */
export const roleAssignmentSchema = z.object({
	role: roleEnum
});

export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
	allowed: boolean;
	reason?: string;
}

/**
 * Role to Permissions Mapping
 * Maps each role to their allowed permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	super_admin: [
		'access_settings',
		'manage_school_admins',
		'access_verification',
		'access_finance',
		'manage_all_tenants',
		'access_global_metrics'
	],
	school_admin: [
		'access_settings',
		'manage_school_admins',
		'access_verification',
		'access_finance'
	],
	verifier: ['access_verification'],
	treasurer: ['access_finance'],
	parent: [] // Parents have no admin permissions
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
	return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
	return [...ROLE_PERMISSIONS[role]];
}

/**
 * Format role for display
 */
export function formatRoleForDisplay(role: UserRole): string {
	const displayNames: Record<UserRole, string> = {
		super_admin: 'Super Admin',
		school_admin: 'School Admin',
		verifier: 'Verifier',
		treasurer: 'Treasurer',
		parent: 'Parent'
	};
	return displayNames[role];
}

/**
 * Validate email format (additional check beyond Zod)
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
