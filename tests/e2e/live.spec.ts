import { test, expect } from '@playwright/test';

test.describe('Terms Audit Desk - Live Production Verification', () => {
  test('loads live Vercel deployment, connects to GenLayer studionet RPC, and renders sample review', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to production Vercel deployment
    await page.goto('https://terms-audit-desk-genlayer.vercel.app');
    await expect(page).toHaveTitle(/Terms Audit Desk/i);

    // Verify Brand Heading
    await expect(page.locator('h1')).toContainText('Prove an AI audit read the whole document');

    // Wait for on-chain audit to load from GenLayer studionet
    await expect(page.locator('text=PASSED AUDIT')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('100.00%', { exact: true })).toBeVisible();

    // Verify proof panel
    await expect(page.locator('text=On-Chain Consensus & Proof of Coverage Panel')).toBeVisible();

    // Test clicking Sample 3: Buried Trap Clause on production
    const sample3 = page.locator('text=Buried Trap Clause').first();
    await sample3.click();

    // Verify FAILED AUDIT banner from studionet
    await expect(page.locator('text=FAILED AUDIT')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=All subscriptions will auto-renew without notice')).toBeVisible();

    // Verify no CORS or unhandled network errors
    const corsErrors = consoleErrors.filter(e => e.includes('CORS') || e.includes('Access-Control-Allow-Origin'));
    expect(corsErrors).toEqual([]);
  });
});
