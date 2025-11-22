import { test, expect } from '@playwright/test';

test('User can create a post and see it in category page', async ({ page }) => {
	// Use a unique email/username for each test run
	const unique = Date.now();
	const email = `user${unique}@test.com`;
	const handle = `user${unique}`;
	const displayName = `User ${unique}`;
	const password = 'User@1234';
	const postTitle = `Test Post ${unique}`;
	const postBody = 'This is a test post body.';

	// Signup
	await page.goto('/signup');
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="handle"]').fill(handle);
	await page.locator('input[name="display_name"]').fill(displayName);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: 'Sign Up' }).click();
	await expect(page).toHaveURL('/login');

	// Login
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: 'Sign In' }).click();
	await expect(page).toHaveURL('/posts');

	// Go to create post page
	await page.goto('/posts/create');

	// Fill in post title
	await page
		.locator('input[placeholder="Enter your post title..."]')
		.fill(postTitle);

	// Select a category (pick the first available option)
	await page
		.locator('[data-state="closed"]:has-text("Select Category")')
		.click();
	// Wait for options to appear and select the first one
	const firstCategory = page.locator('[role="option"]').first();
	const categoryValue = await firstCategory.getAttribute('data-value');
	await firstCategory.click();

	// Fill in post body
	await page
		.locator('textarea[placeholder="Write something interesting..."]')
		.fill(postBody);

	// Click Post button
	await page.locator('button[type="submit"]', { hasText: 'Post' }).click();
	// Should redirect to /posts/category/[categoryId]
	await expect(page).toHaveURL(new RegExp('/posts/category/'));

	// The post title should be visible on the page
	await expect(page.getByText(postTitle)).toBeVisible();
});
