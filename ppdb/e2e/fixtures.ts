import { test as base } from '@playwright/test';

/**
 * Test user fixtures for E2E testing
 * Includes all 5 user roles with appropriate credentials
 */
export const testUsers = {
	super_admin: {
		email: 'super-admin@ppdb-saas.com',
		password: 'test-password-123',
		role: 'super_admin',
		tenantId: null, // Global admin, no tenant restriction
		userId: 'user-super-admin-001'
	},
	school_admin_tenant1: {
		email: 'admin@school1.edu',
		password: 'test-password-123',
		role: 'school_admin',
		tenantId: 'tenant-school-001',
		userId: 'user-school-admin-001'
	},
	school_admin_tenant2: {
		email: 'admin@school2.edu',
		password: 'test-password-123',
		role: 'school_admin',
		tenantId: 'tenant-school-002',
		userId: 'user-school-admin-002'
	},
	verifier_tenant1: {
		email: 'verifier@school1.edu',
		password: 'test-password-123',
		role: 'verifier',
		tenantId: 'tenant-school-001',
		userId: 'user-verifier-001'
	},
	treasurer_tenant1: {
		email: 'treasurer@school1.edu',
		password: 'test-password-123',
		role: 'treasurer',
		tenantId: 'tenant-school-001',
		userId: 'user-treasurer-001'
	},
	parent: {
		phone: '+628123456789',
		role: 'parent',
		tenantId: 'tenant-school-001',
		userId: 'user-parent-001'
	}
};

/**
 * Test tenant fixtures for cross-tenant isolation testing
 */
export const testTenants = {
	tenant1: {
		id: 'tenant-school-001',
		name: 'SMA Negeri 1 Jakarta',
		subdomain: 'sman1-jakarta'
	},
	tenant2: {
		id: 'tenant-school-002',
		name: 'SMA Negeri 2 Jakarta',
		subdomain: 'sman2-jakarta'
	}
};

/**
 * Test session fixture for session management testing
 */
export const testSessions = {
	validFirebaseSession: {
		id: 'session-firebase-valid-001',
		userId: 'user-school-admin-001',
		tenantId: 'tenant-school-001',
		authType: 'firebase' as const,
		authIdentifier: 'admin@school1.edu',
		role: 'school_admin',
		expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
		createdAt: new Date()
	},
	validWAHASession: {
		id: 'session-waha-valid-001',
		userId: 'user-parent-001',
		tenantId: 'tenant-school-001',
		authType: 'waha' as const,
		authIdentifier: '+628123456789',
		role: 'parent',
		expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
		createdAt: new Date()
	},
	expiredSession: {
		id: 'session-expired-001',
		userId: 'user-school-admin-001',
		tenantId: 'tenant-school-001',
		authType: 'firebase' as const,
		authIdentifier: 'admin@school1.edu',
		role: 'school_admin',
		expiresAt: new Date(Date.now() - 1000), // Expired
		createdAt: new Date(Date.now() - 3600000)
	}
};

/**
 * Test audit log fixtures for audit logging verification
 */
export const testAuditLogs = {
	authSuccessLogin: {
		actorId: 'user-school-admin-001',
		action: 'auth_success:login',
		target: null,
		details: JSON.stringify({ ip: '192.168.1.1' })
	},
	authFailureInvalidCredentials: {
		actorId: 'user-parent-001',
		action: 'auth_failure:login',
		target: null,
		details: JSON.stringify({ reason: 'Invalid credentials' })
	},
	authFailurePermissionDenied: {
		actorId: 'user-parent-001',
		action: 'auth_failure:requirePermission',
		target: 'admission_paths:create',
		details: JSON.stringify({
			reason: 'User role parent lacks permission admission_paths:create'
		})
	},
	sensitiveActionAssignRole: {
		actorId: 'user-school-admin-001',
		action: 'sensitive:assign_role',
		target: 'user-verifier-001',
		details: JSON.stringify({ oldRole: 'parent', newRole: 'verifier' })
	}
};

/**
 * Test admission path fixtures for RBAC testing
 */
export const testAdmissionPaths = {
	academicPath: {
		id: 'path-academic-001',
		name: 'Jalur Prestasi Akademik',
		description: 'Jalur berdasarkan nilai rapor dan ujian sekolah',
		quota: 50,
		tenantId: 'tenant-school-001'
	},
	nonAcademicPath: {
		id: 'path-nonacademic-001',
		name: 'Jalur Prestasi Non-Akademik',
		description: 'Jalur berdasarkan prestasi lomba dan kegiatan',
		quota: 30,
		tenantId: 'tenant-school-001'
	}
};

/**
 * Test fee structure fixtures for RBAC testing
 */
export const testFeeStructures = {
	registrationFee: {
		id: 'fee-registration-001',
		name: 'Biaya Pendaftaran',
		amount: 150000,
		type: 'registration',
		tenantId: 'tenant-school-001'
	},
	tuitionFee: {
		id: 'fee-tuition-001',
		name: 'Uang Pangkal',
		amount: 2500000,
		type: 'tuition',
		tenantId: 'tenant-school-001'
	}
};

/**
 * Extended test fixture with user fixtures
 */
export const test = base.extend<{ loginAsUser: typeof testUsers.super_admin }>({
	// eslint-disable-next-line no-empty-pattern
	loginAsUser: async ({}, use) => {
		// Default implementation - can be overridden in tests
		await use(testUsers.super_admin);
	}
});

/**
 * Helper to get user by role
 */
export function getUserByRole(role: keyof typeof testUsers) {
	return testUsers[role];
}

/**
 * Helper to get tenant by id
 */
export function getTenantById(id: string) {
	return Object.values(testTenants).find((t) => t.id === id);
}

/**
 * Helper to generate valid OTP code for testing
 */
export function generateTestOTP(): string {
	return '123456';
}

/**
 * Helper to generate expired OTP for testing
 */
export function generateExpiredOTP(): string {
	return '999999';
}

/**
 * Helper to get session cookie name from environment
 */
export function getSessionCookieName(): string {
	return process.env.SESSION_COOKIE_NAME || 'session_id';
}
