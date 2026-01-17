import type { Page, BrowserContext } from '@playwright/test';
import { getSessionCookieName, generateTestOTP } from './fixtures';
import { expect } from '@playwright/test';

/**
 * Sign in helper for Firebase authentication
 * Navigates to sign-in page, fills credentials, and submits
 */
export async function signInAs(page: Page, email: string, password: string): Promise<void> {
	await page.goto('/sign-in');
	await page.waitForLoadState('networkidle');

	// Fill sign-in form
	await page.fill('input[type="email"]', email);
	await page.fill('input[type="password"]', password);

	// Submit form
	await page.click('button[type="submit"]');

	// Wait for redirect to admin dashboard or next page
	await page.waitForURL(/\/admin/, { timeout: 5000 });
}

/**
 * Sign out helper
 * Clicks sign-out button and waits for redirect
 */
export async function signOut(page: Page): Promise<void> {
	await page.click('button:has-text("Sign Out")');
	await page.waitForURL('/sign-in', { timeout: 3000 });
}

/**
 * Sign up helper for Firebase registration
 * Navigates to sign-up page, fills credentials, and submits
 */
export async function signUpAs(page: Page, email: string, password: string): Promise<void> {
	await page.goto('/sign-up');
	await page.waitForLoadState('networkidle');

	// Fill sign-up form
	await page.fill('input[type="email"]', email);
	await page.fill('input[type="password"]', password);

	// Submit form
	await page.click('button[type="submit"]');

	// Wait for redirect to sign-in or admin dashboard
	await page.waitForURL(/\/(sign-in|admin)/, { timeout: 5000 });
}

/**
 * Request OTP helper for WAHA authentication
 * Navigates to application page, fills phone number, and requests OTP
 */
export async function requestOTP(page: Page, phone: string): Promise<void> {
	// Navigate to application page
	await page.goto('/apply');
	await page.waitForLoadState('networkidle');

	// Fill phone number
	await page.fill('input[type="tel"]', phone);

	// Request OTP
	await page.click('button:has-text("Request OTP")');

	// Wait for OTP input to appear
	await page.waitForSelector('input[maxlength="6"]', { timeout: 3000 });
}

/**
 * Verify OTP helper for WAHA authentication
 * Fills OTP code and submits verification
 */
export async function verifyOTP(page: Page, otpCode: string): Promise<void> {
	// Fill OTP code
	await page.fill('input[maxlength="6"]', otpCode);

	// Verify OTP
	await page.click('button:has-text("Verify OTP")');

	// Wait for success message or redirect
	await page.waitForSelector('text=OTP verified', { timeout: 5000 });
}

/**
 * Complete WAHA authentication flow (request + verify)
 */
export async function authenticateWithWAHA(
	page: Page,
	phone: string,
	otpCode?: string
): Promise<void> {
	await requestOTP(page, phone);
	await verifyOTP(page, otpCode || generateTestOTP());
}

/**
 * Get session cookie from browser context
 */
export async function getSessionCookie(
	context: BrowserContext
): Promise<{ name: string; value: string } | undefined> {
	const cookies = await context.cookies();
	return cookies.find((c) => c.name === getSessionCookieName());
}

/**
 * Wait for session cookie to be set
 */
export async function waitForSessionCookie(
	context: BrowserContext,
	timeout = 5000
): Promise<boolean> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const cookie = await getSessionCookie(context);
		if (cookie && cookie.value) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	return false;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
	const url = page.url();
	return url.includes('/admin') && !url.includes('/sign-in') && !url.includes('/sign-up');
}

/**
 * Check if error message is visible
 */
export async function expectErrorMessage(page: Page, message: string): Promise<void> {
	await expect(page.locator('text=' + message)).toBeVisible();
}

/**
 * Check if success message is visible
 */
export async function expectSuccessMessage(page: Page, message: string): Promise<void> {
	await expect(page.locator('text=' + message)).toBeVisible();
}

/**
 * Navigate to tenant subdomain
 */
export async function navigateToTenant(page: Page, subdomain: string, path = '/'): Promise<void> {
	const url = `http://${subdomain}.localhost:5173${path}`;
	await page.goto(url);
}

/**
 * Assert page is protected (redirects to sign-in)
 */
export async function expectProtectedRouteRedirect(page: Page): Promise<void> {
	await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
}

/**
 * Assert authorization error is shown
 */
export async function expectAuthorizationError(page: Page): Promise<void> {
	await expect(page.locator('text=Unauthorized')).toBeVisible();
}

/**
 * Wait for element to be visible with timeout
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
	await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * Fill form with data object
 */
export async function fillForm(page: Page, fields: Record<string, string>): Promise<void> {
	for (const [key, value] of Object.entries(fields)) {
		const selector = `[name="${key}"], input[type="${key}"], #${key}`;
		await page.fill(selector, value);
	}
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string): Promise<void> {
	await page.click(`button:has-text("${text}")`);
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
	return await page.locator(selector).isVisible();
}

/**
 * Get audit logs via API (requires admin access)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAuditLogs(page: Page): Promise<any[]> {
	// Navigate to audit logs page (admin only)
	await page.goto('/admin/settings/audit-logs');

	// Wait for logs to load
	await page.waitForSelector('[data-test="audit-log-entry"]', { timeout: 5000 });

	// Extract log entries
	const logEntries = await page.locator('[data-test="audit-log-entry"]').all();

	// Return log data
	return Promise.all(
		logEntries.map(async (entry) => {
			const actorId = await entry.locator('[data-field="actorId"]').textContent();
			const action = await entry.locator('[data-field="action"]').textContent();
			const timestamp = await entry.locator('[data-field="timestamp"]').textContent();
			return { actorId, action, timestamp };
		})
	);
}

/**
 * Check if audit log exists
 */
export async function auditLogExists(page: Page, action: string): Promise<boolean> {
	const logs = await getAuditLogs(page);
	return logs.some((log) => log.action === action);
}

/**
 * Wait for page to load completely
 */
export async function waitForPageLoad(page: Page, timeout = 5000): Promise<void> {
	await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take screenshot on failure
 */
export async function screenshotOnFailure(page: Page, testName: string): Promise<void> {
	await page.screenshot({ path: `test-screenshots/${testName}-failure.png` });
}

/**
 * Clear all cookies
 */
export async function clearCookies(context: BrowserContext): Promise<void> {
	await context.clearCookies();
}

/**
 * Set session cookie manually (for testing)
 */
export async function setSessionCookie(context: BrowserContext, sessionId: string): Promise<void> {
	await context.addCookies([
		{
			name: getSessionCookieName(),
			value: sessionId,
			domain: 'localhost',
			path: '/',
			httpOnly: true,
			sameSite: 'Lax',
			expires: Math.floor(Date.now() / 1000) + 3600 // 1 hour
		}
	]);
}

/**
 * Mock OTP response for testing
 * (Use this in conjunction with test environment)
 */
export function mockOTPResponse(phone: string, otp: string): void {
	// This would typically be done by intercepting network requests
	// Implementation depends on test environment setup
	console.log(`Mock OTP for ${phone}: ${otp}`);
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
	page: Page,
	urlPattern: string,
	timeout = 5000
): Promise<void> {
	await page.waitForResponse((response) => response.url().includes(urlPattern), { timeout });
}
