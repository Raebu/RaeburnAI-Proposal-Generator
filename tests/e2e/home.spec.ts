import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Proposal Generator for Consultants');
  await expect(page.locator('button')).toContainText('Generate proposal');
});
