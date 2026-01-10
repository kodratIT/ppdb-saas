import { redirect, error as svelteError } from '@sveltejs/kit';
import type { Session } from './types';
import { getPermissionsForRole, type Permission } from './permissions';
import { logAuthorizationFailure } from './audit-logger';

export interface AuthContext {
	session: Session;
	userId: string;
	tenantId: string;
}

export function requireAuth(locals: App.Locals): AuthContext {
	if (!locals.session || !locals.userId) {
		throw redirect(302, '/sign-in');
	}

	return {
		session: locals.session,
		userId: locals.userId,
		tenantId: locals.tenantId || locals.session.tenantId
	};
}

export function requireRole(auth: AuthContext, ...allowedRoles: string[]): void {
	if (!allowedRoles || allowedRoles.length === 0) {
		return;
	}

	const userRole = auth.session.role;

	if (!userRole) {
		throw new Error('Unauthorized: Role required');
	}

	if (!allowedRoles.includes(userRole)) {
		throw new Error(`Unauthorized: Role ${userRole} is not allowed`);
	}
}

export function requireTenantMatch(auth: AuthContext, routeTenantId: string): void {
	if (auth.tenantId !== routeTenantId) {
		throw svelteError(403, 'Unauthorized: Tenant mismatch');
	}
}

export function requirePermission(auth: AuthContext, ...permissions: Permission[]): void {
	if (!auth.session.role) {
		logAuthorizationFailure(
			auth.userId,
			`requirePermission: ${permissions.join(', ')}`,
			'User has no role'
		);
		throw svelteError(403, 'Unauthorized: Insufficient permissions');
	}

	const userPermissions = getPermissionsForRole(auth.session.role as any);

	const hasPermission = permissions.some((perm) => userPermissions.includes(perm));

	if (!hasPermission) {
		logAuthorizationFailure(
			auth.userId,
			`requirePermission: ${permissions.join(', ')}`,
			`User role ${auth.session.role} lacks required permissions`
		);
		throw svelteError(403, 'Unauthorized: Insufficient permissions');
	}
}

export function requireAllPermissions(auth: AuthContext, ...permissions: Permission[]): void {
	if (!auth.session.role) {
		logAuthorizationFailure(
			auth.userId,
			`requireAllPermissions: ${permissions.join(', ')}`,
			'User has no role'
		);
		throw svelteError(403, 'Unauthorized: Insufficient permissions');
	}

	const userPermissions = getPermissionsForRole(auth.session.role as any);

	const hasAllPermissions = permissions.every((perm) => userPermissions.includes(perm));

	if (!hasAllPermissions) {
		logAuthorizationFailure(
			auth.userId,
			`requireAllPermissions: ${permissions.join(', ')}`,
			`User role ${auth.session.role} lacks all required permissions`
		);
		throw svelteError(403, 'Unauthorized: Insufficient permissions');
	}
}

export function requireSuperAdmin(auth: AuthContext): void {
	if (auth.session.role !== 'super_admin') {
		logAuthorizationFailure(
			auth.userId,
			'requireSuperAdmin',
			`User role ${auth.session.role} is not super_admin`
		);
		throw svelteError(403, 'Unauthorized: Super Admin access required');
	}
}
