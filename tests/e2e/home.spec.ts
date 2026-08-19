import { expect, test } from '@playwright/test';

test.describe('RaeburnAI Proposal Generator E2E Flow', () => {
  test('home page loads and allows proposal generation flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Raeburn Consulting Group');
    await expect(page.locator('h2')).toContainText('AI Proposal & Solution Generator');

    // Click Load Demo Client Data
    await page.click('button:has-text("Load Demo Client Data")');

    // Verify form input populated
    const clientNameInput = page.locator('input[required]');
    await expect(clientNameInput).toHaveValue('Northstar Advisory Group');

    // Submit proposal generation
    await page.click('button:has-text("Generate Executive Proposal")');

    // Verify proposal rendering
    await expect(
      page.getByRole('heading', { name: 'Commercial Client Proposal — Northstar Advisory Group' })
    ).toBeVisible();
    await expect(page.getByText('DEMONSTRATION DATA — NOT FOR CLIENT USE')).toBeVisible();
    await expect(page.getByText(/Deterministic fallback draft/)).toBeVisible();
    await expect(page.locator('text=DRAFT_REQUIRES_HUMAN_REVIEW')).toBeVisible();
    await expect(page.locator('text=1. Executive Summary')).toBeVisible();
    await expect(page.locator('text=8. Commercial Pricing Tiers')).toBeVisible();
    await expect(page.locator('text=10. Deterministic ROI & Financial Model')).toBeVisible();
  });
});
