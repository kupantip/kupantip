import { test, expect } from '@playwright/test';

test('Login test with admin acccess', async ({ page }) => {
	await page.goto('/login');

	await page.locator('input[name="email"]').fill('admin@admin.com');

	await page.locator('input[name="password"]').fill('Admin@1234');

	await page.getByRole('button', { name: 'Sign In' }).click();

	await expect(page).toHaveURL('/posts');
});
