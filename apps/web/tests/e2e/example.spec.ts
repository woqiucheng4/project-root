import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Next.js default is probably something else, but this is an example
  await expect(page).toHaveTitle(/Create Next App|Next.js/);
});
