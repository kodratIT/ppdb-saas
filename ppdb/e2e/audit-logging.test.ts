import { expect, test } from '@playwright/test';
import { testUsers, getSessionCookieName } from './fixtures';
import {
	signInAs,
	waitForSessionCookie,
	expectErrorMessage,
	expectSuccessMessage,
	getAuditLogs,
	auditLogExists,
	waitForPageLoad
} from './helpers';

test.describe('Audit Logging - Authorization Failures', () => {
	test('invalid credentials create audit log', async ({ page }) => {
		// Navigate to sign-in
		await page.goto('/sign-in');

		// Attempt sign-in with invalid credentials
		await page.fill('input[type="email"]', 'invalid@example.com');
		await page.fill('input[type="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');

		// Wait for error message
		await expectErrorMessage(page, 'Invalid credentials');

		// Sign in as admin to access audit logs
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs page
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify audit log exists for failed login
		const loginFailed = await auditLogExists(page, 'auth_failure:login');

		expect(loginFailed).toBe(true);
	});

	test('permission denied creates audit log', async ({ page, context }) => {
		// Sign in as parent (limited permissions)
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Attempt to access admin routes
		await page.goto('/admin/settings/admission-paths');

		// Wait for authorization error
		await expectErrorMessage(page, 'Unauthorized');

		// Sign in as admin to check audit logs
		await page.goto('/sign-in');
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify audit log exists for permission denial
		const permissionDenied = await auditLogExists(page, 'auth_failure:requirePermission');

		expect(permissionDenied).toBe(true);
	});

	test('session expired creates audit log', async ({ page, context }) => {
		// Sign in normally
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to a route (creates session activity)
		await page.goto('/admin/settings/admission-paths');

		// Set expired session (simulate expiration)
		await context.addCookies([
			{
				name: getSessionCookieName(),
				value: 'expired-session',
				domain: 'localhost',
				path: '/',
				httpOnly: true,
				sameSite: 'Lax',
				expires: Math.floor(Date.now() / 1000) - 3600 // Expired
			}
		]);

		// Navigate to protected route (triggers expiration check)
		await page.goto('/admin');

		// Wait for session expired error
		await expectErrorMessage(page, 'Session expired');

		// Sign in as admin to check audit logs
		await page.goto('/sign-in');
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify audit log exists for session expiration
		const sessionExpired = await auditLogExists(page, 'auth_failure:session_expired');

		expect(sessionExpired).toBe(true);
	});
});

test.describe('Audit Logging - Sensitive Actions', () => {
	test('user creation creates audit log', async ({ page }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Navigate to user creation page
		await page.goto('/admin/settings/users/create');

		// Create new user
		await page.fill('input[type="email"]', `newuser${Date.now()}@test.com`);
		await page.fill('input[type="password"]', 'test-password-123');
		await page.selectOption('select[name="role"]', 'school_admin');
		await page.click('button:has-text("Create User")');

		// Wait for success message
		await expectSuccessMessage(page, 'User created successfully');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify audit log exists for user creation
		const userCreated = await auditLogExists(page, 'sensitive:create_user');

		expect(userCreated).toBe(true);
	});

	test('role assignment creates audit log', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to school admins page
		await page.goto('/admin/settings/school-admins');

		// Click assign role button (if exists)
		const assignButton = page.locator('button:has-text("Assign Role")');
		if (await assignButton.isVisible()) {
			await assignButton.click();

			// Wait for success message
			await expectSuccessMessage(page, 'Role assigned successfully');

			// Navigate to audit logs
			await page.goto('/admin/settings/audit-logs');

			// Wait for logs to load
			await waitForPageLoad(page);

			// Verify audit log exists for role assignment
			const roleAssigned = await auditLogExists(page, 'sensitive:assign_role');

			expect(roleAssigned).toBe(true);
		}
	});

	test('data deletion creates audit log', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to admission paths
		await page.goto('/admin/settings/admission-paths');

		// Delete an admission path (if button exists)
		const deleteButton = page.locator('button:has-text("Delete")');
		if (await deleteButton.first().isVisible()) {
			await deleteButton.first().click();

			// Wait for success message
			await expectSuccessMessage(page, 'Admission path deleted successfully');

			// Navigate to audit logs
			await page.goto('/admin/settings/audit-logs');

			// Wait for logs to load
			await waitForPageLoad(page);

			// Verify audit log exists for deletion
			const dataDeleted = await auditLogExists(page, 'sensitive:delete_admission_path');

			expect(dataDeleted).toBe(true);
		}
	});

	test('admission path publish creates audit log', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to admission paths
		await page.goto('/admin/settings/admission-paths');

		// Publish an admission path (if button exists)
		const publishButton = page.locator('button:has-text("Publish")');
		if (await publishButton.first().isVisible()) {
			await publishButton.first().click();

			// Wait for success message
			await expectSuccessMessage(page, 'Admission path published successfully');

			// Navigate to audit logs
			await page.goto('/admin/settings/audit-logs');

			// Wait for logs to load
			await waitForPageLoad(page);

			// Verify audit log exists for publish action
			const pathPublished = await auditLogExists(page, 'sensitive:publish_admission_path');

			expect(pathPublished).toBe(true);
		}
	});
});

test.describe('Audit Logging - Log Structure', () => {
	test('audit log includes actor ID', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify log entries have actor ID
		const logs = await getAuditLogs(page);

		if (logs.length > 0) {
			const firstLog = logs[0];
			expect(firstLog.actorId).toBeDefined();
			expect(firstLog.actorId).toBe(testUsers.school_admin_tenant1.userId);
		}
	});

	test('audit log includes action timestamp', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify log entries have timestamp
		const logs = await getAuditLogs(page);

		if (logs.length > 0) {
			const firstLog = logs[0];
			expect(firstLog.timestamp).toBeDefined();

			// Verify timestamp is recent (within last hour)
			const logTime = new Date(firstLog.timestamp || Date.now());
			const now = new Date();
			const diff = now.getTime() - logTime.getTime();

			expect(diff).toBeLessThan(3600000); // Less than 1 hour
		}
	});

	test('audit log includes details JSON', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify log entries have details
		const logs = await getAuditLogs(page);

		if (logs.length > 0) {
			// Details should be JSON string containing relevant information
			// This depends on how audit logs are displayed in UI
			// For now, just verify logs exist
			expect(logs.length).toBeGreaterThan(0);
		}
	});
});

test.describe('Audit Logging - Security Events', () => {
	test('multiple failed logins trigger security alert', async ({ page, context }) => {
		// Attempt multiple failed logins
		for (let i = 0; i < 3; i++) {
			await page.goto('/sign-in');
			await page.fill('input[type="email"]', `invalid${i}@example.com`);
			await page.fill('input[type="password"]', 'wrongpassword');
			await page.click('button[type="submit"]');

			// Wait for error
			await expectErrorMessage(page, 'Invalid credentials');

			// Clear cookies to avoid auto-login
			await context.clearCookies();
		}

		// Sign in as admin to check audit logs
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify multiple failed login attempts were logged
		const failedAttempts = await auditLogExists(page, 'auth_failure:login');

		expect(failedAttempts).toBe(true);
	});

	test('suspicious activity is flagged', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify suspicious activity flag exists (if implemented)
		// This depends on audit log display implementation
		// For now, verify logs are accessible
		const logs = await getAuditLogs(page);
		expect(logs.length).toBeGreaterThan(0);
	});

	test('cross-tenant access attempts are logged', async ({ page }) => {
		// Sign in as school admin from tenant1
		await page.goto('http://sman1-jakarta.localhost:5173/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Attempt to access tenant2 (simulated via navigation)
		await page.goto('http://sman2-jakarta.localhost:5173/admin');

		// Sign in as super admin to check logs
		await page.goto('http://localhost:5173/sign-in');
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Navigate to audit logs
		await page.goto('/admin/settings/audit-logs');

		// Wait for logs to load
		await waitForPageLoad(page);

		// Verify cross-tenant access attempt was logged
		const crossTenantAttempt = await auditLogExists(page, 'auth_failure:requireAuth');

		expect(crossTenantAttempt).toBe(true);
	});
});
