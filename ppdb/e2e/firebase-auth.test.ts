import { expect, test, type BrowserContext } from '@playwright/test';
import { testUsers, getSessionCookieName } from './fixtures';
import {
	signInAs,
	signOut,
	signUpAs,
	getSessionCookie,
	waitForSessionCookie,
	isAuthenticated,
	expectErrorMessage,
	expectSuccessMessage,
	waitForPageLoad
} from './helpers';

test.describe('Firebase Sign-In Flow - Complete', () => {
	test('happy path: sign-in, create session, access admin dashboard', async ({ page, context }) => {
		// Navigate to sign-in page
		await page.goto('/sign-in');
		await waitForPageLoad(page);

		// Verify page loaded correctly
		await expect(page.locator('h1')).toContainText('Sign In');
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();

		// Sign in with test credentials
		const user = testUsers.school_admin_tenant1;
		await signInAs(page, user.email, user.password);

		// Verify redirect to admin dashboard
		await expect(page).toHaveURL('/admin', { timeout: 5000 });

		// Verify session cookie was set
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();
		expect(sessionCookie?.name).toBe(getSessionCookieName());

		// Verify admin dashboard loads
		await expect(page.locator('h1')).toContainText('Admin Dashboard');
	});

	test('sign-in with invalid credentials shows error message', async ({ page }) => {
		// Navigate to sign-in page
		await page.goto('/sign-in');

		// Fill with invalid credentials
		await page.fill('input[type="email"]', 'nonexistent@example.com');
		await page.fill('input[type="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');

		// Verify error message
		await expectErrorMessage(page, 'Invalid credentials');

		// Verify no redirect
		await expect(page).toHaveURL('/sign-in');
	});

	test('sign-in with empty email shows validation error', async ({ page }) => {
		await page.goto('/sign-in');

		// Submit empty form
		await page.click('button[type="submit"]');

		// Verify validation error
		await expectErrorMessage(page, 'Email is required');
	});

	test('sign-in with empty password shows validation error', async ({ page }) => {
		await page.goto('/sign-in');

		// Fill email but not password
		await page.fill('input[type="email"]', 'test@example.com');
		await page.click('button[type="submit"]');

		// Verify validation error
		await expectErrorMessage(page, 'Password is required');
	});

	test('sign-in creates session with correct role from Firebase', async ({ page, context }) => {
		const user = testUsers.school_admin_tenant1;

		// Sign in
		await signInAs(page, user.email, user.password);

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Verify authentication state
		const authenticated = await isAuthenticated(page);
		expect(authenticated).toBe(true);

		// Verify role is preserved in session
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Access a page that requires school_admin role
		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');
	});

	test('sign-out clears session cookie', async ({ page, context }) => {
		// Sign in first
		const user = testUsers.school_admin_tenant1;
		await signInAs(page, user.email, user.password);

		// Verify session exists
		let sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Sign out
		await signOut(page);

		// Verify session cookie was cleared
		sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();

		// Verify redirect to sign-in page
		await expect(page).toHaveURL('/sign-in');
	});

	test('sign-out from admin dashboard works correctly', async ({ page, context }) => {
		// Sign in and navigate to admin dashboard
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');
		await expect(page).toHaveURL('/admin');

		// Click sign out button
		await page.click('button:has-text("Sign Out")');

		// Verify redirect
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });

		// Verify no access to protected routes
		await page.goto('/admin/settings/admission-paths');
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
	});
});

test.describe('Firebase Sign-Up Flow - Complete', () => {
	test('happy path: sign-up, create Firebase user, create database user', async ({
		page,
		context
	}) => {
		// Navigate to sign-up page
		await page.goto('/sign-up');
		await waitForPageLoad(page);

		// Verify page loaded correctly
		await expect(page.locator('h1')).toContainText('Sign Up');
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();

		// Sign up with new user
		const newEmail = `newuser${Date.now()}@test.com`;
		await signUpAs(page, newEmail, 'test-password-123');

		// Wait for redirect (either to sign-in or admin)
		await page.waitForURL(/\/(sign-in|admin)/, { timeout: 5000 });

		// Verify redirect happened
		const currentUrl = page.url();
		expect(currentUrl).toMatch(/\/(sign-in|admin)/);
	});

	test('sign-up with existing email shows error', async ({ page }) => {
		// Navigate to sign-up page
		await page.goto('/sign-up');

		// Try to sign up with existing email
		await signUpAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify error message
		await expectErrorMessage(page, 'Email already exists');
	});

	test('sign-up with invalid email format shows validation error', async ({ page }) => {
		await page.goto('/sign-up');

		// Fill invalid email
		await page.fill('input[type="email"]', 'invalid-email');
		await page.fill('input[type="password"]', 'test-password-123');
		await page.click('button[type="submit"]');

		// Verify validation error
		await expectErrorMessage(page, 'Invalid email format');
	});

	test('sign-up with weak password shows validation error', async ({ page }) => {
		await page.goto('/sign-up');

		// Fill weak password
		await page.fill('input[type="email"]', 'newuser@test.com');
		await page.fill('input[type="password"]', '123');
		await page.click('button[type="submit"]');

		// Verify validation error
		await expectErrorMessage(page, 'Password must be at least 8 characters');
	});

	test('sign-up without tenant selection uses default tenant', async ({ page, context }) => {
		// Navigate to sign-up with tenant subdomain
		await page.goto('http://sman1-jakarta.localhost:5173/sign-up');

		// Sign up
		const newEmail = `newuser${Date.now()}@test.com`;
		await signUpAs(page, newEmail, 'test-password-123');

		// Wait for redirect
		await page.waitForURL(/\/(sign-in|admin)/, { timeout: 5000 });

		// Verify session cookie has correct tenant
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Access admin page
		await page.goto('/admin');

		// Verify user has correct tenant context
		await expect(page.locator('h1')).toContainText('Admin Dashboard');
	});
});

test.describe('Firebase Auth - Role Preservation', () => {
	test('super_admin can access all admin routes', async ({ page }) => {
		// Sign in as super admin
		await signInAs(page, testUsers.super_admin.email, testUsers.super_admin.password);

		// Access various admin routes
		await page.goto('/admin/settings/tenants');
		await expect(page.locator('h1')).toContainText('Tenant Management');

		await page.goto('/admin/settings/school-admins');
		await expect(page.locator('h1')).toContainText('School Admins');

		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');
	});

	test('school_admin cannot access tenant management', async ({ page }) => {
		// Sign in as school admin
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Attempt to access tenant management
		await page.goto('/admin/settings/tenants');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});

	test('verifier cannot create admission paths', async ({ page }) => {
		// Sign in as verifier
		await signInAs(page, testUsers.verifier_tenant1.email, 'test-password-123');

		// Access admission paths
		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		// Verify create button is not visible
		const createButton = page.locator('button:has-text("Create Path")');
		await expect(createButton).not.toBeVisible();
	});

	test('treasurer cannot access verification settings', async ({ page }) => {
		// Sign in as treasurer
		await signInAs(page, testUsers.treasurer_tenant1.email, 'test-password-123');

		// Attempt to access admission paths (should fail - treasurer only has fee/payment access)
		await page.goto('/admin/settings/admission-paths');

		// Verify access denied
		await expectErrorMessage(page, 'Unauthorized');
		await expect(page).toHaveURL('/admin', { timeout: 3000 });
	});
});
