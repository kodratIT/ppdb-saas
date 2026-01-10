import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.describe('Firebase Authentication - Internal Users', () => {
		test('sign-in page exists and has required fields', async ({ page }) => {
			await page.goto('/sign-in');

			await expect(page.locator('h1')).toContainText('Sign In');
			await expect(page.locator('input[type="email"]')).toBeVisible();
			await expect(page.locator('input[type="password"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('sign-up page exists and has required fields', async ({ page }) => {
			await page.goto('/sign-up');

			await expect(page.locator('h1')).toContainText('Sign Up');
			await expect(page.locator('input[type="email"]')).toBeVisible();
			await expect(page.locator('input[type="password"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('shows error for invalid credentials', async ({ page }) => {
			await page.goto('/sign-in');

			await page.fill('input[type="email"]', 'nonexistent@example.com');
			await page.fill('input[type="password"]', 'wrongpassword');
			await page.click('button[type="submit"]');

			await expect(page.locator('text=Invalid credentials')).toBeVisible();
		});

		test('redirects to admin dashboard after successful sign-in', async ({ page }) => {
			await page.goto('/sign-in');

			await page.fill('input[type="email"]', 'admin@example.com');
			await page.fill('input[type="password"]', 'password123');
			await page.click('button[type="submit"]');

			await expect(page).toHaveURL('/admin', { timeout: 5000 });
		});
	});

	test.describe('Tenant Isolation', () => {
		test('preserves tenant context during authentication', async ({ page, context }) => {
			const subdomain = 'test-school';
			await page.goto(`http://${subdomain}.localhost:5173/sign-in`);

			await page.fill('input[type="email"]', 'school-admin@example.com');
			await page.fill('input[type="password"]', 'password123');
			await page.click('button[type="submit"]');

			const cookies = await context.cookies();
			const sessionCookie = cookies.find((c) => c.name === 'session_id');

			expect(sessionCookie).toBeDefined();
		});

		test('denies access to wrong tenant', async ({ page }) => {
			await page.goto('/admin');

			await expect(page.locator('text=Unauthorized')).toBeVisible();
			await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
		});
	});

	test.describe('WAHA OTP - External Users', () => {
		test('shows OTP request form', async ({ page }) => {
			await page.goto('/apply');

			await expect(page.locator('input[type="tel"]')).toBeVisible();
			await expect(page.locator('button:has-text("Request OTP")')).toBeVisible();
		});

		test('validates phone number format', async ({ page }) => {
			await page.goto('/apply');

			await page.fill('input[type="tel"]', '123');
			await page.click('button:has-text("Request OTP")');

			await expect(page.locator('text=Invalid phone number')).toBeVisible();
		});

		test('shows OTP input after request', async ({ page }) => {
			await page.goto('/apply');

			await page.fill('input[type="tel"]', '08123456789');
			await page.click('button:has-text("Request OTP")');

			await expect(page.locator('input[maxlength="6"]')).toBeVisible();
			await expect(page.locator('button:has-text("Verify OTP")')).toBeVisible();
		});

		test('verifies OTP and creates session', async ({ page, context }) => {
			await page.goto('/apply');

			await page.fill('input[type="tel"]', '08123456789');
			await page.click('button:has-text("Request OTP")');

			await page.fill('input[maxlength="6"]', '123456');
			await page.click('button:has-text("Verify OTP")');

			await expect(page.locator('text=OTP verified')).toBeVisible();

			const cookies = await context.cookies();
			const sessionCookie = cookies.find((c) => c.name === 'session_id');

			expect(sessionCookie).toBeDefined();
		});
	});

	test.describe('Session Management', () => {
		test('signs out and clears session', async ({ page, context }) => {
			await page.goto('/admin');

			await page.click('button:has-text("Sign Out")');

			const cookies = await context.cookies();
			const sessionCookie = cookies.find((c) => c.name === 'session_id');

			expect(sessionCookie).toBeUndefined();
		});

		test('handles expired session gracefully', async ({ page }) => {
			await page.goto('/admin');

			await expect(page.locator('text=Session expired')).toBeVisible();
			await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
		});
	});

	test.describe('Admin Routes Authentication', () => {
		test('protects admin dashboard', async ({ page }) => {
			await page.goto('/admin');

			await expect(page).toHaveURL('/sign-in', { timeout: 3000 });
		});

		test('allows access with valid session', async ({ page }) => {
			await page.goto('/sign-in');

			await page.fill('input[type="email"]', 'admin@example.com');
			await page.fill('input[type="password"]', 'password123');
			await page.click('button[type="submit"]');

			await expect(page).toHaveURL('/admin');
		});
	});
});
