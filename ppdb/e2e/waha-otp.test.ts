import { expect, test } from '@playwright/test';
import { testUsers, getSessionCookieName, generateTestOTP } from './fixtures';
import {
	requestOTP,
	verifyOTP,
	authenticateWithWAHA,
	getSessionCookie,
	waitForSessionCookie,
	isAuthenticated,
	expectErrorMessage,
	expectSuccessMessage,
	waitForPageLoad
} from './helpers';

test.describe('WAHA OTP Flow - Complete', () => {
	test('happy path: request OTP, verify, create session', async ({ page, context }) => {
		// Navigate to application page
		await page.goto('/apply');
		await waitForPageLoad(page);

		// Verify OTP request form is visible
		await expect(page.locator('input[type="tel"]')).toBeVisible();
		await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();

		// Request OTP
		const user = testUsers.parent;
		await requestOTP(page, user.phone);

		// Wait for OTP input to appear
		await expect(page.locator('input[maxlength="6"]')).toBeVisible();
		await expect(page.locator('button:has-text("Verify OTP")')).toBeVisible();

		// Verify OTP with test code
		const otpCode = generateTestOTP();
		await verifyOTP(page, otpCode);

		// Wait for success message
		await expectSuccessMessage(page, 'OTP verified');

		// Verify session cookie was set
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();
		expect(sessionCookie?.name).toBe(getSessionCookieName());

		// Verify user is authenticated
		const authenticated = await isAuthenticated(page);
		expect(authenticated).toBe(true);
	});

	test('request OTP with invalid phone number format shows error', async ({ page }) => {
		// Navigate to application page
		await page.goto('/apply');

		// Fill invalid phone number
		await page.fill('input[type="tel"]', '123');

		// Request OTP
		await page.click('button:has-text("Request OTP")');

		// Verify error message
		await expectErrorMessage(page, 'Invalid phone number');

		// Verify no redirect happened
		await expect(page).toHaveURL('/apply');
	});

	test('request OTP with empty phone number shows validation error', async ({ page }) => {
		// Navigate to application page
		await page.goto('/apply');

		// Leave phone empty
		await page.click('button:has-text("Request OTP")');

		// Verify validation error
		await expectErrorMessage(page, 'Phone number is required');
	});

	test('verify OTP with invalid code shows error', async ({ page, context }) => {
		// Request valid OTP
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Clear session and try to verify again with invalid code
		await context.clearCookies();

		// Navigate back to application
		await page.goto('/apply');

		// Request OTP again
		await requestOTP(page, testUsers.parent.phone);

		// Verify with wrong OTP
		await verifyOTP(page, '999999');

		// Verify error message
		await expectErrorMessage(page, 'Invalid OTP code');

		// Verify no session was created
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();
	});

	test('verify OTP with expired code shows error', async ({ page, context }) => {
		// Request valid OTP first
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Clear session
		await context.clearCookies();

		// Try to verify with "expired" OTP
		await page.goto('/apply');
		await requestOTP(page, testUsers.parent.phone);

		// Verify with expired OTP
		await verifyOTP(page, '000000');

		// Verify error message
		await expectErrorMessage(page, 'OTP has expired');

		// Verify no session was created
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();
	});

	test('verify OTP multiple failed attempts locks account temporarily', async ({
		page,
		context
	}) => {
		// Request OTP
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Try multiple wrong OTP codes
		for (let i = 0; i < 5; i++) {
			await context.clearCookies();
			await page.goto('/apply');
			await requestOTP(page, testUsers.parent.phone);
			await verifyOTP(page, `wrong${i}`);

			// On the 5th attempt, should get locked message
			if (i === 4) {
				await expectErrorMessage(page, 'Too many failed attempts. Please try again later.');
			}
		}

		// Verify no session was created
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();
	});

	test('WAHA session allows access to application pages', async ({ page, context }) => {
		// Authenticate with WAHA
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Navigate to application dashboard
		await page.goto('/apply/dashboard');

		// Verify dashboard loads
		await expect(page.locator('h1')).toContainText('Application Dashboard');

		// Verify authenticated
		const authenticated = await isAuthenticated(page);
		expect(authenticated).toBe(true);
	});

	test('WAHA session prevents access to admin routes', async ({ page, context }) => {
		// Authenticate with WAHA (parent role)
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Attempt to access admin routes
		await page.goto('/admin');

		// Verify redirect to sign-in
		await expect(page).toHaveURL('/sign-in', { timeout: 3000 });

		// Verify error message
		await expectErrorMessage(page, 'Unauthorized: Admin access required');

		// Verify session still exists (for application access)
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();
	});

	test('WAHA sign-out clears session correctly', async ({ page, context }) => {
		// Authenticate with WAHA
		await authenticateWithWAHA(page, testUsers.parent.phone, generateTestOTP());

		// Verify session exists
		let sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Sign out (if sign-out button exists for WAHA users)
		const signOutButton = page.locator('button:has-text("Sign Out")');
		if (await signOutButton.isVisible()) {
			await signOutButton.click();
		}

		// Verify session cookie was cleared
		sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeUndefined();

		// Verify redirect to application page
		await expect(page).toHaveURL('/apply', { timeout: 3000 });
	});

	test('WAHA OTP code format validation', async ({ page }) => {
		// Request OTP
		await requestOTP(page, testUsers.parent.phone);

		// Try to verify with invalid format (less than 6 digits)
		await page.fill('input[maxlength="6"]', '12345');

		// Click verify button
		await page.click('button:has-text("Verify OTP")');

		// Verify validation error
		await expectErrorMessage(page, 'OTP must be 6 digits');

		// Try to verify with invalid format (non-digits)
		await page.fill('input[maxlength="6"]', 'abcdef');

		// Click verify button
		await page.click('button:has-text("Verify OTP")');

		// Verify validation error
		await expectErrorMessage(page, 'OTP must be 6 digits');

		// Verify correct format works
		await page.fill('input[maxlength="6"]', generateTestOTP());
		await page.click('button:has-text("Verify OTP")');

		// Verify success
		await expectSuccessMessage(page, 'OTP verified');
	});

	test('WAHA resend OTP flow works correctly', async ({ page, context }) => {
		// Request OTP
		await requestOTP(page, testUsers.parent.phone);

		// Wait for OTP input
		await expect(page.locator('input[maxlength="6"]')).toBeVisible();

		// Click resend button (if exists)
		const resendButton = page.locator('button:has-text("Resend OTP")');
		if (await resendButton.isVisible()) {
			await resendButton.click();

			// Wait for confirmation message
			await expectSuccessMessage(page, 'New OTP sent');

			// Verify can still verify with new OTP
			const newOTP = generateTestOTP();
			await verifyOTP(page, newOTP);

			// Verify session created
			const sessionCookie = await getSessionCookie(context);
			expect(sessionCookie).toBeDefined();
		}
	});

	test('WAHA phone number persistence during OTP verification', async ({ page }) => {
		// Request OTP with phone number
		await requestOTP(page, testUsers.parent.phone);

		// Verify phone number is still visible
		const phoneInput = page.locator('input[type="tel"]');
		const phoneValue = await phoneInput.inputValue();

		expect(phoneValue).toBe(testUsers.parent.phone);

		// Phone should be read-only after OTP request
		const isReadOnly = await phoneInput.isDisabled();
		expect(isReadOnly).toBe(true);
	});

	test('WAHA session includes tenant context from subdomain', async ({ page, context }) => {
		// Navigate to tenant subdomain
		await page.goto('http://sman1-jakarta.localhost:5173/apply');

		// Request OTP
		await requestOTP(page, testUsers.parent.phone);

		// Verify OTP
		await verifyOTP(page, generateTestOTP());

		// Wait for session
		const hasSession = await waitForSessionCookie(context);
		expect(hasSession).toBe(true);

		// Verify tenant is preserved
		const sessionCookie = await getSessionCookie(context);
		expect(sessionCookie).toBeDefined();

		// Navigate to application dashboard
		await page.goto('/apply/dashboard');

		// Verify tenant branding is visible (school name, logo)
		await expect(page.locator('h1')).toContainText('SMA Negeri 1 Jakarta');
	});
});
