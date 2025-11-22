import { test, expect } from '@playwright/test';

test('Search functionality works', async ({ page }) => {
	await page.goto('/');

	const searchInput = page.getByPlaceholder('Search...');
	await searchInput.fill('Community');
	await searchInput.press('Enter');

	await expect(page).toHaveURL(/\/search\?q=Community/);

	await expect(page.getByText('Community')).toBeVisible();

	await expect(page.getByRole('tab', { name: /Categories/ })).toBeVisible();
});
