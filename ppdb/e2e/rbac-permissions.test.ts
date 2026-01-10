import { expect, test, type BrowserContext } from '@playwright/test';
import { testUsers, testAdmissionPaths, testFeeStructures, getSessionCookieName } from './fixtures';
import {
	signInAs,
	signOut,
	getSessionCookie,
	waitForSessionCookie,
	isAuthenticated,
	expectErrorMessage,
	expectSuccessMessage,
	isElementVisible,
	clickButton,
	waitForPageLoad
} from './helpers';

test.describe('RBAC Permissions - Super Admin', () => {
	test('super_admin can access all admin routes', async ({ page, context }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access all admin routes
		await page.goto('/admin/settings/tenants');
		await expect(page.locator('h1')).toContainText('Tenant Management');

		await page.goto('/admin/settings/school-admins');
		await expect(page.locator('h1')).toContainText('School Admins');

		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		await page.goto('/admin/settings/fee-structures');
		await expect(page.locator('h1')).toContainText('Fee Structures');
	});

	test('super_admin can create tenant', async ({ page }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Access tenant creation
		await page.goto('/admin/settings/tenants');

		// Verify create button is visible
		const createButton = page.locator('button:has-text("Create Tenant")');
		await expect(createButton).toBeVisible();
	});

	test('super_admin can access cross-tenant data', async ({ page }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Access tenant1 data
		await page.goto('/admin/settings/tenants');
		await expect(page.locator('h1')).toContainText('Tenant Management');

		// Access tenant2 data (super admin should see all)
		await page.goto('/admin/settings/tenants/tenant-school-002');
		await expect(page.locator('h1')).toContainText('Tenant Details');
	});
});

test.describe('RBAC Permissions - School Admin', () => {
	test('school_admin can access own tenant routes', async ({ page, context }) => {
		// Sign in as school admin tenant1
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access own tenant routes
		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		await page.goto('/admin/settings/fee-structures');
		await expect(page.locator('h1')).toContainText('Fee Structures');

		await page.goto('/admin/settings/school-admins');
		await expect(page.locator('h1')).toContainText('School Admins');
	});

	test('school_admin can create admission paths', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify create button is visible
		const createButton = page.locator('button:has-text("Create Path")');
		await expect(createButton).toBeVisible();
	});

	test('school_admin can create fee structures', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Access fee structures
		await page.goto('/admin/settings/fee-structures');

		// Verify create button is visible
		const createButton = page.locator('button:has-text("Create Fee")');
		await expect(createButton).toBeVisible();
	});

	test('school_admin can archive admission paths', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify archive button is visible (only school admin has this permission)
		const archiveButton = page.locator('button:has-text("Archive")');
		await expect(archiveButton).toBeVisible();
	});

	test('school_admin cannot access tenant management', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Attempt to access tenant management
		await page.goto('/admin/settings/tenants');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Super Admin access required');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('school_admin can assign roles to other users', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Access school admins page
		await page.goto('/admin/settings/school-admins');

		// Verify assign role button is visible
		const assignButton = page.locator('button:has-text("Assign Role")');
		await expect(assignButton).toBeVisible();
	});
});

test.describe('RBAC Permissions - Verifier', () => {
	test('verifier can read admission paths', async ({ page, context }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify page loads
		await expect(page.locator('h1')).toContainText('Admission Paths');
	});

	test('verifier cannot create admission paths', async ({ page }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify create button is NOT visible
		const createButton = page.locator('button:has-text("Create Path")');
		await expect(createButton).not.toBeVisible();
	});

	test('verifier cannot archive admission paths', async ({ page }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify archive button is NOT visible (only school admin has this permission)
		const archiveButton = page.locator('button:has-text("Archive")');
		await expect(archiveButton).not.toBeVisible();
	});

	test('verifier cannot access fee management', async ({ page }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Attempt to access fee structures
		await page.goto('/admin/settings/fee-structures');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Insufficient permissions');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('verifier cannot access school admin management', async ({ page }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Attempt to access school admins page
		await page.goto('/admin/settings/school-admins');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Insufficient permissions');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});
});

test.describe('RBAC Permissions - Treasurer', () => {
	test('treasurer can read fee structures', async ({ page, context }) => {
		// Sign in as treasurer
		await signInAs(page, testUsers.treasurer_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access fee structures
		await page.goto('/admin/settings/fee-structures');

		// Verify page loads
		await expect(page.locator('h1')).toContainText('Fee Structures');
	});

	test('treasurer cannot access admission path management', async ({ page }) => {
		// Sign in as treasurer
		await signInAs(page, testUsers.treasurer_tenant1.email, 'test-password-123');

		// Attempt to access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Insufficient permissions');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('treasurer cannot create admission paths', async ({ page }) => {
		// Sign in as treasurer
		await signInAs(page, testUsers.treasurer_tenant1.email, 'test-password-123');

		// Attempt to access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify create button is NOT visible
		const createButton = page.locator('button:has-text("Create Path")');
		await expect(createButton).not.toBeVisible();
	});

	test('treasurer cannot access school admin management', async ({ page }) => {
		// Sign in as treasurer
		await signInAs(page, testUsers.treasurer_tenant1.email, 'test-password-123');

		// Attempt to access school admins page
		await page.goto('/admin/settings/school-admins');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Insufficient permissions');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});
});

test.describe('RBAC Permissions - Parent (WAHA User)', () => {
	test('parent cannot access admin routes', async ({ page, context }) => {
		// Authenticate with WAHA (parent)
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Attempt to access admin routes
		await page.goto('/admin');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Admin access required');
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
	});

	test('parent can access application routes', async ({ page, context }) => {
		// Authenticate with WAHA (parent)
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access application dashboard
		await page.goto('/apply/dashboard');

		// Verify page loads
		await expect(page.locator('h1')).toContainText('Application Dashboard');
	});

	test('parent cannot create admission paths', async ({ page, context }) => {
		// Authenticate with WAHA
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Attempt to access admission paths
		await page.goto('/admin/settings/admission-paths');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Admin access required');
	});

	test('parent cannot access fee management', async ({ page, context }) => {
		// Authenticate with WAHA
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Attempt to access fee structures
		await page.goto('/admin/settings/fee-structures');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized: Admin access required');
	});
});
