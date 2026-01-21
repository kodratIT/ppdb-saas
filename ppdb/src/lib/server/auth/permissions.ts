import type { UserRole } from '$lib/server/db/schema';

// Define all available permissions
export type Permission =
	// Tenant Management
	| 'tenant:read'
	| 'tenant:create'
	| 'tenant:update'
	| 'tenant:delete'
	| 'tenant:manage_status'

	// User Management
	| 'user:read'
	| 'user:create'
	| 'user:update'
	| 'user:delete'
	| 'user:invite'
	| 'user:manage_roles'

	// School Configuration
	| 'settings:read'
	| 'settings:manage'
	| 'branding:manage'
	| 'admission_paths:manage'
	| 'fee_structures:manage'

	// Verification
	| 'verification:read'
	| 'verification:manage'
	| 'documents:verify'

	// Scoring & Ranking
	| 'scoring:read'
	| 'scoring:input'
	| 'scoring:finalize'
	| 'ranking:view'
	| 'ranking:finalize'

	// Finance
	| 'finance:view'
	| 'finance:verify_manual'
	| 'finance:payout'
	| 'finance:export'

	// Communication
	| 'broadcast:view'
	| 'broadcast:create'
	| 'notification:manage'

	// Reports & Analytics
	| 'reports:view'
	| 'reports:export'
	| 'reports:dapodik'

	// Super Admin Only
	| 'super_admin:access'
	| 'super_admin:platform_settings'
	| 'super_admin:impersonate'
	| 'super_admin:view_audit_logs'
	| 'super_admin:health_monitoring';

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
	super_admin: [
		'tenant:read',
		'tenant:create',
		'tenant:update',
		'tenant:delete',
		'tenant:manage_status',
		'user:read',
		'user:create',
		'user:update',
		'user:delete',
		'user:invite',
		'user:manage_roles',
		'settings:read',
		'settings:manage',
		'branding:manage',
		'admission_paths:manage',
		'fee_structures:manage',
		'verification:read',
		'verification:manage',
		'documents:verify',
		'scoring:read',
		'scoring:input',
		'scoring:finalize',
		'ranking:view',
		'ranking:finalize',
		'finance:view',
		'finance:verify_manual',
		'finance:payout',
		'finance:export',
		'broadcast:view',
		'broadcast:create',
		'notification:manage',
		'reports:view',
		'reports:export',
		'reports:dapodik',
		'super_admin:access',
		'super_admin:platform_settings',
		'super_admin:impersonate',
		'super_admin:view_audit_logs',
		'super_admin:health_monitoring'
	],

	school_admin: [
		'tenant:read',
		'tenant:update',
		'user:read',
		'user:create',
		'user:update',
		'user:invite',
		'settings:read',
		'settings:manage',
		'branding:manage',
		'admission_paths:manage',
		'fee_structures:manage',
		'verification:read',
		'verification:manage',
		'documents:verify',
		'scoring:read',
		'scoring:input',
		'scoring:finalize',
		'ranking:view',
		'ranking:finalize',
		'finance:view',
		'finance:verify_manual',
		'finance:export',
		'broadcast:view',
		'broadcast:create',
		'notification:manage',
		'reports:view',
		'reports:export',
		'reports:dapodik'
	],

	verifier: ['tenant:read', 'verification:read', 'verification:manage', 'documents:verify'],

	treasurer: [
		'tenant:read',
		'finance:view',
		'finance:verify_manual',
		'finance:payout',
		'finance:export',
		'reports:view'
	],

	interviewer: ['tenant:read', 'scoring:read', 'scoring:input'],

	field_officer: ['tenant:read', 'verification:read', 'scoring:read', 'scoring:input'],

	parent: ['tenant:read']
};

// Helper functions
export function getPermissionsForRole(role: UserRole): Permission[] {
	return rolePermissions[role] || [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
	const permissions = getPermissionsForRole(role);
	return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
	const userPermissions = getPermissionsForRole(role);
	return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
	const userPermissions = getPermissionsForRole(role);
	return permissions.every((p) => userPermissions.includes(p));
}
