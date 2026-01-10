import { eq, and } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import {
	schoolAdminCreateSchema,
	roleAssignmentSchema,
	type UserRole,
	type Permission,
	ROLE_PERMISSIONS
} from '../../../schema/school-admin';

export type SchoolAdmin = typeof schema.users.$inferSelect;
export type NewSchoolAdmin = typeof schema.users.$inferInsert;

/**
 * Custom error for business rule violations
 */
export class BusinessRuleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BusinessRuleError';
	}
}

/**
 * List all admin users for a tenant (school_admin, verifier, treasurer)
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @returns Array of admin users
 */
export async function listSchoolAdmins(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string
): Promise<SchoolAdmin[]> {
	const allUsers = await db.select().from(schema.users).where(eq(schema.users.tenantId, tenantId));

	// Filter to only admin roles (exclude parents)
	const adminRoles: UserRole[] = ['school_admin', 'verifier', 'treasurer', 'super_admin'];
	return allUsers.filter((user) => adminRoles.includes(user.role));
}

/**
 * Get user by ID for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns User or null if not found
 */
export async function getUserById(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	userId: string
): Promise<SchoolAdmin | null> {
	const results = await db
		.select()
		.from(schema.users)
		.where(and(eq(schema.users.id, userId), eq(schema.users.tenantId, tenantId)));

	return results[0] || null;
}

/**
 * Get user by email for a tenant
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param email - User email
 * @returns User or null if not found
 */
export async function getUserByEmail(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	email: string
): Promise<SchoolAdmin | null> {
	const results = await db
		.select()
		.from(schema.users)
		.where(and(eq(schema.users.tenantId, tenantId), eq(schema.users.email, email.toLowerCase())));

	return results[0] || null;
}

/**
 * Create new school admin
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param data - School admin data
 * @returns Created school admin
 */
export async function createSchoolAdmin(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	data: any
): Promise<SchoolAdmin> {
	// Validate input
	const validatedData = schoolAdminCreateSchema.parse(data);

	// Check if email already exists for this tenant
	const existingUser = await getUserByEmail(db, tenantId, validatedData.email);
	if (existingUser) {
		throw new BusinessRuleError('User with this email already exists in this tenant');
	}

	// Create user
	const created = await db
		.insert(schema.users)
		.values({
			tenantId,
			email: validatedData.email,
			name: validatedData.name,
			role: validatedData.role,
			status: 'active'
		})
		.returning();

	return created[0];
}

/**
 * Assign new role to user
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @param role - New role to assign
 * @returns Updated user
 */
export async function assignRoleToUser(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	userId: string,
	role: UserRole
): Promise<SchoolAdmin> {
	// Validate role
	roleAssignmentSchema.parse({ role });

	// Check if user exists
	const existingUser = await getUserById(db, tenantId, userId);
	if (!existingUser) {
		throw new BusinessRuleError('User not found');
	}

	// Update user role
	const updated = await db
		.update(schema.users)
		.set({
			role,
			updatedAt: new Date()
		})
		.where(and(eq(schema.users.id, userId), eq(schema.users.tenantId, tenantId)))
		.returning();

	if (updated.length === 0) {
		throw new BusinessRuleError('User not found');
	}

	return updated[0];
}

/**
 * Revoke user access by deactivating account
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Updated user
 */
export async function revokeAccess(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	userId: string
): Promise<SchoolAdmin> {
	// Check if user exists
	const existingUser = await getUserById(db, tenantId, userId);
	if (!existingUser) {
		throw new BusinessRuleError('User not found');
	}

	// Deactivate user
	const updated = await db
		.update(schema.users)
		.set({
			status: 'inactive',
			updatedAt: new Date()
		})
		.where(and(eq(schema.users.id, userId), eq(schema.users.tenantId, tenantId)))
		.returning();

	if (updated.length === 0) {
		throw new BusinessRuleError('User not found');
	}

	return updated[0];
}

/**
 * Check if user has permission to perform action
 * This is a simple placeholder for now, will be enhanced with full RBAC system later
 * @param userRole - User's role
 * @param userTenantId - User's tenant ID
 * @param targetTenantId - Target tenant ID (the one being accessed)
 * @param requiredPermissions - Required permissions
 * @returns True if user has all required permissions
 */
export function checkPermissions(
	userRole: UserRole,
	userTenantId: string,
	targetTenantId: string,
	requiredPermissions: Permission[]
): boolean {
	// Super admins can access any tenant
	if (userRole === 'super_admin') {
		return true;
	}

	// Non-super-admins can only access their own tenant
	if (userTenantId !== targetTenantId) {
		return false;
	}

	// Get permissions for this role
	const rolePermissions = ROLE_PERMISSIONS[userRole];

	// Check if user has all required permissions
	return requiredPermissions.every((permission) => rolePermissions.includes(permission));
}

/**
 * Get all permissions for a specific role
 * @param role - User role
 * @returns Array of permissions
 */
export function getAllowedPermissionsForRole(role: UserRole): Permission[] {
	return [...ROLE_PERMISSIONS[role]];
}

/**
 * Check if user has a specific permission
 * @param userRole - User's role
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
	return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Activate user account
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param userId - User ID
 * @returns Updated user
 */
export async function activateUser(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	userId: string
): Promise<SchoolAdmin> {
	// Check if user exists
	const existingUser = await getUserById(db, tenantId, userId);
	if (!existingUser) {
		throw new BusinessRuleError('User not found');
	}

	// Activate user
	const updated = await db
		.update(schema.users)
		.set({
			status: 'active',
			updatedAt: new Date()
		})
		.where(and(eq(schema.users.id, userId), eq(schema.users.tenantId, tenantId)))
		.returning();

	if (updated.length === 0) {
		throw new BusinessRuleError('User not found');
	}

	return updated[0];
}

/**
 * Delete user permanently
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param userId - User ID
 */
export async function deleteUser(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	userId: string
): Promise<void> {
	// Check if user exists
	const existingUser = await getUserById(db, tenantId, userId);
	if (!existingUser) {
		throw new BusinessRuleError('User not found');
	}

	await db
		.delete(schema.users)
		.where(and(eq(schema.users.id, userId), eq(schema.users.tenantId, tenantId)));
}
