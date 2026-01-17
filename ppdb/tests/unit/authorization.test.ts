/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect, error as svelteError } from '@sveltejs/kit';
import {
	requireAuth,
	requireRole,
	requirePermission,
	requireAllPermissions,
	requireSuperAdmin,
	type AuthContext
} from '$lib/server/auth/authorization';
import { PERMISSIONS } from '$lib/server/auth/permissions';

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn((code, url) => {
		throw Object.assign(new Error(`Redirect to ${url}`), { status: code });
	}),
	error: vi.fn((statusCode, message) => {
		throw Object.assign(new Error(message), { status: statusCode });
	})
}));

// Define Locals interface directly to avoid import issues
interface Locals {
	session?: {
		id: string;
		userId: string;
		tenantId: string;
		authType: 'firebase' | 'waha';
		authIdentifier: string;
		expiresAt: Date;
		createdAt: Date;
		role?: string;
	};
	userId?: string;
	tenantId?: string;
}

let mockRedirect: any;
beforeEach(() => {
	mockRedirect = vi.mocked(redirect);
});

describe('requireAuth', () => {
	it('returns auth context when session exists and userId is set', () => {
		const locals: Locals = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			},
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		const result = requireAuth(locals);

		expect(result).toEqual({
			session: locals.session,
			userId: 'user-123',
			tenantId: 'tenant-123'
		});
	});

	it('returns auth context with session.tenantId when locals.tenantId is not set', () => {
		const locals: Locals = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'session-tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			},
			userId: 'user-123'
		};

		const result = requireAuth(locals);

		expect(result).toEqual({
			session: locals.session,
			userId: 'user-123',
			tenantId: 'session-tenant-123'
		});
	});

	it('throws redirect to /sign-in when session is missing', () => {
		const locals: Locals = {};

		expect(() => {
			requireAuth(locals);
		}).toThrow();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/sign-in');
	});

	it('throws redirect to /sign-in when userId is missing', () => {
		const locals: Locals = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			}
		};

		expect(() => {
			requireAuth(locals);
		}).toThrow();
		expect(mockRedirect).toHaveBeenCalledWith(302, '/sign-in');
	});
});

describe('requireRole', () => {
	it('does not throw when user role is in allowed roles', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'school_admin'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireRole(authContext, 'school_admin');
		}).not.toThrow();
	});

	it('does not throw when user role is one of multiple allowed roles', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'verifier'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireRole(authContext, 'school_admin', 'verifier', 'treasurer');
		}).not.toThrow();
	});

	it('does not throw when no roles are provided (no restriction)', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireRole(authContext);
		}).not.toThrow();
	});

	it('throws error when user role is not in allowed roles', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'treasurer'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireRole(authContext, 'school_admin', 'verifier');
		}).toThrow('Unauthorized: Role treasurer is not allowed');
	});

	it('throws error when user has no role but roles are required', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireRole(authContext, 'school_admin');
		}).toThrow('Unauthorized: Role required');
	});
});

describe('requirePermission', () => {
	it('does not throw when user has one of the required permissions', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'school_admin'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requirePermission(authContext, PERMISSIONS.ADMISSION_PATHS_CREATE);
		}).not.toThrow();
	});

	it('does not throw when user has any of multiple required permissions', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'verifier'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requirePermission(
				authContext,
				PERMISSIONS.ADMISSION_PATHS_CREATE,
				PERMISSIONS.APPLICATIONS_VERIFY
			);
		}).not.toThrow();
	});

	it('throws error when user lacks all required permissions', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'parent'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requirePermission(authContext, PERMISSIONS.ADMISSION_PATHS_CREATE);
		}).toThrow('Unauthorized: Insufficient permissions');
	});

	it('throws error when user has no role', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requirePermission(authContext, PERMISSIONS.ADMISSION_PATHS_CREATE);
		}).toThrow('Unauthorized: Insufficient permissions');
	});
});

describe('requireAllPermissions', () => {
	it('does not throw when user has all required permissions', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'school_admin'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireAllPermissions(
				authContext,
				PERMISSIONS.ADMISSION_PATHS_CREATE,
				PERMISSIONS.FEES_CREATE
			);
		}).not.toThrow();
	});

	it('throws error when user lacks one of the required permissions', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'verifier'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireAllPermissions(authContext, PERMISSIONS.APPLICATIONS_VERIFY, PERMISSIONS.FEES_CREATE);
		}).toThrow('Unauthorized: Insufficient permissions');
	});

	it('throws error when user has no role', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireAllPermissions(authContext, PERMISSIONS.ADMISSION_PATHS_CREATE);
		}).toThrow('Unauthorized: Insufficient permissions');
	});
});

describe('requireSuperAdmin', () => {
	it('does not throw when user is super_admin', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'super_admin'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireSuperAdmin(authContext);
		}).not.toThrow();
	});

	it('throws error when user is school_admin', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'school_admin'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireSuperAdmin(authContext);
		}).toThrow('Unauthorized: Super Admin access required');
	});

	it('throws error when user is verifier', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				role: 'verifier'
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireSuperAdmin(authContext);
		}).toThrow('Unauthorized: Super Admin access required');
	});

	it('throws error when user has no role', () => {
		const authContext = {
			session: {
				id: 'session-123',
				userId: 'user-123',
				tenantId: 'tenant-123',
				authType: 'firebase',
				authIdentifier: 'user@example.com',
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date()
			} as any,
			userId: 'user-123',
			tenantId: 'tenant-123'
		};

		expect(() => {
			requireSuperAdmin(authContext);
		}).toThrow('Unauthorized: Super Admin access required');
	});
});
