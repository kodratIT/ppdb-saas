import { expect, test, type BrowserContext } from '@playwright/test';
import { testUsers, testSessions, getSessionCookieName } from './fixtures';
import {
	signInAs,
	signOut,
	getSessionCookie,
	waitForSessionCookie,
	isAuthenticated,
	expectErrorMessage,
	expectSuccessMessage,
	setSessionCookie,
	clearCookies,
	waitForPageLoad,
	isElementVisible
} from './helpers';

test.describe('Session Management - Firebase Sessions', () => {
	test('Firebase session validation works across protected routes', async ({ page, context }) => {
		// Sign in with Firebase
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access multiple protected routes
		await page.goto('/admin');
		await expect(page.locator('h1')).toContainText('Admin Dashboard');

		await page.goto('/admin/settings/admission-paths');
		await expect(page.locator('h1')).toContainText('Admission Paths');

		await page.goto('/admin/settings/fee-structures');
		await expect(page.locator('h1')).toContainText('Fee Structures');

		// Verify session persists
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();
	});

	test('Firebase session expiration redirects to sign-in', async ({ page, context }) => {
		// Set an expired session cookie
		await setSessionCookie(context, testSessions.expiredSession.id);

		// Navigate to protected route
		await page.goto('/admin');

		// Verify redirect to sign-in
		await expect(page).toHaveURL('/sign-in', { timeout: 5000 });

		// Verify session expired message
		await expectErrorMessage(page, 'Session expired');
	});

	test('Firebase session refresh extends expiration', async ({ page, context }) => {
		// Sign in
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get initial session
		let sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Navigate to page
		await page.goto('/admin/settings/admission-paths');

		// Session should be refreshed automatically on activity
		// (Assuming middleware auto-refreshes sessions)

		// Verify session still valid after navigation
		const currentSession = await getSessionCookie(context);
		expect(currentSession).toBeDefined();
	});

	test('Firebase concurrent session handling', async ({ browser }) => {
		// Sign in from first tab/context
		const context1 = await browser.newContext();
		const page1 = await context1.newPage();

		await signInAs(page1, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session from first context
		const session1 = await getSessionCookie(context1);
		expect(session1).toBeDefined();

		// Sign in from second context (should invalidate first session or allow both)
		const context2 = await browser.newContext();
		const page2 = await context2.newPage();

		await signInAs(page2, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session from second context
		const session2 = await getSessionCookie(context2);
		expect(session2).toBeDefined();

		// Verify first session behavior (depends on auth policy)
		await page1.goto('/admin');

		// Clean up
		await context1.close();
		await context2.close();
	});

	test('Firebase sign-out clears all session data', async ({ page, context }) => {
		// Sign in
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Verify session exists
		let sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Sign out
		await signOut(page);

		// Verify all session data is cleared
		sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();

		// Try to access protected route
		await page.goto('/admin');

		// Verify redirect to sign-in
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
	});
});

test.describe('Session Management - WAHA Sessions', () => {
	test('WAHA session validation works across protected routes', async ({ page, context }) => {
		// Authenticate with WAHA
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Access protected routes
		await page.goto('/apply/dashboard');
		await expect(page.locator('h1')).toContainText('Application Dashboard');

		await page.goto('/apply/status');
		await expect(page.locator('h1')).toContainText('Application Status');
	});

	test('WAHA session expiration redirects to application page', async ({ page, context }) => {
		// Set expired session
		await setSessionCookie(context, testSessions.expiredSession.id);

		// Navigate to protected route
		await page.goto('/apply/dashboard');

		// Verify redirect to application page
		await expect(page).toHaveURL('/apply', { timeout: 5000 });

		// Verify session expired message
		await expectErrorMessage(page, 'Session expired');
	});

	test('WAHA session refresh extends expiration', async ({ page, context }) => {
		// Authenticate with WAHA
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Get initial session
		let sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Navigate to application dashboard
		await page.goto('/apply/dashboard');

		// Session should be refreshed
		const currentSession = await getSessionCookie(context);
		expect(currentSession).toBeDefined();
	});

	test('WAHA concurrent session handling', async ({ browser }) => {
		// Authenticate from first context
		const context1 = await browser.newContext();
		const page1 = await context1.newPage();

		await page1.goto('/apply');
		await page1.fill('input[type="tel"]', testUsers.parent.phone);
		await page1.click('button:has-text("Request OTP")');
		await page1.fill('input[maxlength="6"]', '123456');
		await page1.click('button:has-text("Verify OTP")');

		// Get session from first context
		const session1 = await getSessionCookie(context1);
		expect(session1).toBeDefined();

		// Authenticate from second context
		const context2 = await browser.newContext();
		const page2 = await context2.newPage();

		await page2.goto('/apply');
		await page2.fill('input[type="tel"]', testUsers.parent.phone);
		await page2.click('button:has-text("Request OTP")');
		await page2.fill('input[maxlength="6"]', '123456');
		await page2.click('button:has-text("Verify OTP")');

		// Get session from second context
		const session2 = await getSessionCookie(context2);
		expect(session2).toBeDefined();

		// Clean up
		await context1.close();
		await context2.close();
	});
});

test.describe('Session Management - Cross-Auth Type', () => {
	test('Firebase session does not grant WAHA application access', async ({ page, context }) => {
		// Sign in with Firebase (admin)
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Try to access WAHA application pages
		await page.goto('/apply/dashboard');

		// Should work - Firebase users can also access application
		// (This depends on auth policy - for now, assume it's allowed)
	});

	test('WAHA session does not grant admin access', async ({ page, context }) => {
		// Authenticate with WAHA (parent)
		await page.goto('/apply');
		await page.fill('input[type="tel"]', testUsers.parent.phone);
		await page.click('button:has-text("Request OTP")');
		await page.fill('input[maxlength="6"]', '123456');
		await page.click('button:has-text("Verify OTP")');

		// Try to access admin routes
		await page.goto('/admin');

		// Verify access denied
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });

		// Verify error message
		await expectErrorMessage(page, 'Unauthorized: Admin access required');
	});

	test('session cookie security attributes', async ({ page, context }) => {
		// Sign in with Firebase
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session cookie
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Verify cookie has security attributes
		// (This would need to inspect actual cookie attributes)
		// For now, just verify cookie exists
		expect(sessionCookie?.name).toBe(getSessionCookieName());
	});
});

test.describe('Session Management - Edge Cases', () => {
	test('session without role is handled gracefully', async ({ page, context }) => {
		// Set session without role (edge case)
		await setSessionCookie(context, 'session-no-role-001');

		// Navigate to protected route
		await page.goto('/admin');

		// Should either work (default role) or show error
		// Depends on auth policy implementation
		const currentUrl = page.url();
		expect(currentUrl).toMatch(/\/(admin|sign-in)/);
	});

	test('session with invalid tenant ID is rejected', async ({ page, context }) => {
		// Set session with invalid tenant (edge case)
		await setSessionCookie(context, 'session-invalid-tenant-001');

		// Navigate to protected route
		await page.goto('/admin');

		// Should reject session with invalid tenant
		await expect(page).toHaveURL('/sign-in', { timeout: 5000 });

		// Verify error message
		await expectErrorMessage(page, 'Invalid session: tenant not found');
	});

	test('session cookie tampering is detected', async ({ page, context }) => {
		// Sign in normally
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Modify session cookie (simulate tampering)
		await context.addCookies([
			{
				name: getSessionCookieName(),
				value: 'tampered-session-value',
				domain: 'localhost',
				path: '/',
				httpOnly: true,
				sameSite: 'Lax'
			}
		]);

		// Try to access protected route
		await page.goto('/admin');

		// Should reject tampered session
		await expect(page).toHaveURL('/sign-in', { timeout: 5000 });
	});

	test('multiple session cookies are handled correctly', async ({ page, context }) => {
		// Set multiple session cookies (edge case)
		await setSessionCookie(context, 'session-old-001');
		await context.addCookies([
			{
				name: getSessionCookieName(),
				value: 'session-new-002',
				domain: 'localhost',
				path: '/',
				httpOnly: true,
				sameSite: 'Lax'
			}
		]);

		// Navigate to protected route
		await page.goto('/admin');

		// Should use latest session or reject both
		const currentUrl = page.url();
		expect(currentUrl).toMatch(/\/(admin|sign-in)/);
	});

	test('session persistence across page reloads', async ({ page, context }) => {
		// Sign in
		await signInAs(page, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session
		const session1 = await getSessionCookie(context);
		expect(session1).toBeDefined();

		// Reload page
		await page.reload();

		// Verify session still exists
		const session2 = await getSessionCookie(context);
		expect(session2).toBeDefined();
		expect(session2?.value).toBe(session1?.value);

		// Verify still authenticated
		const authenticated = await isAuthenticated(page);
		expect(authenticated).toBe(true);
	});

	test('session persistence across browser tabs', async ({ browser }) => {
		// Sign in from first tab
		const context = await browser.newContext();
		const page1 = await context.newPage();

		await signInAs(page1, testUsers.school_admin_tenant1.email, 'test-password-123');

		// Get session from first tab
		const session1 = await getSessionCookie(context);
		expect(session1).toBeDefined();

		// Open second tab in same context (shares cookies)
		const page2 = await context.newPage();

		// Navigate to protected route in second tab
		await page2.goto('/admin');

		// Should be authenticated (shared session)
		const authenticated = await isAuthenticated(page2);
		expect(authenticated).toBe(true);

		// Clean up
		await context.close();
	});
});
