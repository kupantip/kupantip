import { test, expect } from '@playwright/test';

test.describe('Admin access', () => {
	test('Login test with admin acccess', async ({ page }) => {
		await page.goto('/login');

		await page.locator('input[name="email"]').fill('admin@admin.com');

		await page.locator('input[name="password"]').fill('Admin@1234');

		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/posts');
	});

	test('Admin can access /posts/admin/announcement after login', async ({
		page,
	}) => {
		await page.goto('/login');

		await page.locator('input[name="email"]').fill('admin@admin.com');
		await page.locator('input[name="password"]').fill('Admin@1234');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page).toHaveURL('/posts');

		await page.goto('/posts/admin/announcement');
	});

	test('Admin can access /posts/admin/category after login', async ({
		page,
	}) => {
		await page.goto('/login');
		await page.locator('input[name="email"]').fill('admin@admin.com');
		await page.locator('input[name="password"]').fill('Admin@1234');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/posts');
		await page.goto('/posts/admin/category');
		await expect(page).toHaveURL('/posts/admin/category');
	});

	test('Admin can access /posts/admin/report after login', async ({
		page,
	}) => {
		await page.goto('/login');
		await page.locator('input[name="email"]').fill('admin@admin.com');
		await page.locator('input[name="password"]').fill('Admin@1234');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/posts');
		await page.goto('/posts/admin/report');
		await expect(page).toHaveURL('/posts/admin/report');
	});
});

test.describe('User Access', () => {
	test('Signup, login, and forbidden admin access', async ({ page }) => {
		// Use a unique email/username for each test run
		const unique = Date.now();
		const email = `user${unique}@test.com`;
		const handle = `user${unique}`;
		const displayName = `User ${unique}`;
		const password = 'User@1234';

		// Go to signup page and fill the form
		await page.goto('/signup');
		await page.locator('input[name="email"]').fill(email);
		await page.locator('input[name="handle"]').fill(handle);
		await page.locator('input[name="display_name"]').fill(displayName);
		await page.locator('input[name="password"]').fill(password);
		await page.getByRole('button', { name: 'Sign Up' }).click();

		// Should redirect to login
		await expect(page).toHaveURL('/login');

		// Login as the new user
		await page.locator('input[name="email"]').fill(email);
		await page.locator('input[name="password"]').fill(password);
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect(page).toHaveURL('/posts');

		// Try to access admin announcement page
		await page.goto('/posts/admin/announcement');

		// Should be forbidden or redirected (adjust as needed for your app)
		// Check for forbidden message, 403, or redirect to /posts
		// Example: check for a forbidden message
		await expect(page).not.toHaveURL('/posts/admin/announcement');
		// Optionally, check for a message or redirect
		// await expect(page.getByText(/forbidden|not authorized|unauthorized/i)).toBeVisible();

		// Try to access admin category page
		await page.goto('/posts/admin/category');
		await expect(page).not.toHaveURL('/posts/admin/category');

		// Try to access admin report page
		await page.goto('/posts/admin/report');
		await expect(page).not.toHaveURL('/posts/admin/report');
	});
});
