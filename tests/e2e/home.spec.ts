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

  test('exports safely without browser persistence', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'print', {
        value: () => window.dispatchEvent(new Event('proposal-print-test'))
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Load Demo Client Data/ }).click();
    await page.getByRole('button', { name: 'Generate Executive Proposal' }).click();
    await expect(page.getByText('DRAFT_REQUIRES_HUMAN_REVIEW')).toBeVisible();

    await page.getByRole('button', { name: /Copy Text/ }).click();
    await expect(page.getByRole('button', { name: /Copied/ })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('EXECUTIVE PROPOSAL — Northstar Advisory Group');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /JSON/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^proposal-1\.0-\d+\.json$/);

    await page.getByRole('button', { name: /Print \/ PDF/ }).click();

    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookies: document.cookie
    }));
    expect(storage).toEqual({ local: [], session: [], cookies: '' });
  });

  test('serves security headers and does not expose a server credential', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['permissions-policy']).toContain('camera=()');

    const html = await response.text();
    expect(html).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/);
    expect(html).not.toContain('OPENAI_API_KEY');
  });
});
