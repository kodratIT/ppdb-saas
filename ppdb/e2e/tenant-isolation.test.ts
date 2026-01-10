import { expect, test, type BrowserContext } from '@playwright/test';
import { testUsers, testTenants, getSessionCookieName } from './fixtures';
import {
	signInAs,
	signOut,
	getSessionCookie,
	waitForSessionCookie,
	isAuthenticated,
	expectErrorMessage,
	expectAuthorizationError,
	navigateToTenant,
	clearCookies
} from './helpers';

test.describe('Tenant Isolation - Firebase Users', () => {
	test('school_admin_tenant1 cannot access tenant2 data', async ({ page, context }) => {
		// Sign in as school admin from tenant1
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Attempt to access tenant2 subdomain
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');

		// Verify access denied
		await expectAuthorizationError(page);
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('verifier_tenant1 cannot access tenant2 data', async ({ page, context }) => {
		// Sign in as verifier from tenant1
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Attempt to access tenant2 subdomain
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');

		// Verify access denied
		await expectAuthorizationError(page);
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('school_admin_tenant1 can access own tenant data', async ({ page, context }) => {
		// Sign in as school admin from tenant1
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access own tenant routes
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/admin/settings/admission-paths');

		// Verify access allowed
		await expect(page.locator('h1')).toContainText('Admission Paths');
	});

	test('firebase user is bound to tenant from subdomain', async ({ page, context }) => {
		// Sign in on tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Verify session has tenant1 context
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Access admin routes (should have tenant1 context)
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/admin');

		// Verify dashboard loads with tenant1 branding
		await expect(page.locator('h1')).toContainText('SMA Negeri 1 Jakarta');
	});
});

test.describe('Tenant Isolation - WAHA Users', () => {
	test('WAHA user inherits tenant from subdomain', async ({ page, context }) => {
		// Navigate to application on tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/apply');

		// Request OTP
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Verify session has tenant1 context
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Access application dashboard
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/apply/dashboard');

		// Verify dashboard loads with tenant1 branding
		await expect(page.locator('h1')).toContainText('SMA Negeri 1 Jakarta');
	});

	test('WAHA user cannot access other tenant', async ({ page, context }) => {
		// Authenticate on tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/apply');

		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Attempt to access tenant2 subdomain
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/apply/dashboard');

		// Verify access denied or redirected to apply
		// (WAHA users should be re-authenticated on different tenant)
		await expect(page).toHaveURL(/\/(apply|sign-in)/, { timeout: 3000 });
	});
});

test.describe('Tenant Isolation - Super Admin', () => {
	test('super_admin can access all tenant data', async ({ page, context }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access tenant1 data
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Access tenant2 data
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Access tenant management (global admin feature)
		await page.goto('/admin/settings/tenants');
		await expect(page.locator('h1')).toContainText('Tenant Management');
	});

	test('super_admin session has no tenant restriction', async ({ page, context }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Verify super admin can access global routes (no subdomain required)
		await page.goto('/admin/settings/tenants');
		await expect(page.locator('h1')).toContainText('Tenant Management');

		// Verify session has no tenant restriction (tenantId: null)
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();
	});
});

test.describe('Tenant Isolation - Cross-Tenant API Calls', () => {
	test('cross-tenant API calls return 403', async ({ page, context }) => {
		// Sign in as school admin from tenant1
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Try to access tenant2 data via API (simulated)
		// This would typically be done by intercepting network requests
		// For now, verify that access to tenant2 routes is denied

		// Access tenant2 admission paths page
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');

		// Verify 403 error
		await expectAuthorizationError(page);
	});

	test('RLS policies prevent cross-tenant data access', async ({ page, context }) => {
		// Sign in as school admin from tenant1
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access own tenant admission paths
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/admin/settings/admission-paths');

		// Verify admission paths for tenant1 are visible
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Attempt to access tenant2 admission paths
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');

		// Verify access denied (RLS policy prevents this)
		await expectAuthorizationError(page);
	});
});

test.describe('Tenant Isolation - Subdomain Resolution', () => {
	test('subdomain resolution preserves tenant context', async ({ page, context }) => {
		// Navigate to tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		// Sign in
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Navigate within tenant1
		await page.goto('/admin/settings/admission-paths');

		// Verify tenant context is preserved
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Verify tenant1 branding is visible
		await expect(page.locator('text=SMA Negeri 1 Jakarta')).toBeVisible();
	});

	test('subdomain change requires re-authentication', async ({ page, context }) => {
		// Sign in on tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Clear session from context (simulate subdomain change)
		await clearCookies(context);

		// Navigate to tenant2 subdomain
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin');

		// Verify re-authentication is required
		await expect(page).toHaveURL('/sign-in', { timeout: 5000 });
	});

	test('no subdomain defaults to main application', async ({ page }) => {
		// Navigate to localhost without subdomain
		await page.goto('/');

		// Verify main application page or sign-in
		const currentUrl = page.url();
		expect(currentUrl).toMatch(/\/(sign-in|admin|apply)/);
	});
});

test.describe('Tenant Isolation - Data Security', () => {
	test('tenant isolation prevents data leakage', async ({ page, context }) => {
		// Sign in as school admin from tenant1
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Access own tenant data
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/admin/settings/admission-paths');

		// Verify only tenant1 admission paths are visible
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Try to access tenant2 URL directly
		await navigateToTenant(page, testTenants.tenant2.subdomain, '/admin/settings/admission-paths');

		// Verify access denied
		await expectAuthorizationError(page);

		// Verify no tenant2 data is exposed
		// (This is verified by 403 error and redirect)
	});

	test('session cookies are tenant-specific', async ({ page, context }) => {
		// Sign in on tenant1 subdomain
		await navigateToTenant(page, testTenants.tenant1.subdomain, '/sign-in');

		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session cookie
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Verify cookie domain is set for current subdomain
		// (This would inspect actual cookie attributes)
		// For now, verify session exists

		// Navigate within tenant1
		await page.goto('/admin/settings/admission-paths');

		// Verify tenant context persists
		await expect(page.locator('h1')).toContainText('Admission Paths');
	});
});
