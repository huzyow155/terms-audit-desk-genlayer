import { test, expect } from '@playwright/test';

test.describe('Terms Audit Desk - Read-Only Flow', () => {
  test('renders landing page, loads sample audit, and verifies on-chain data', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:4173');
    await expect(page).toHaveTitle(/Terms Audit Desk/i);

    // Verify Brand Headline
    const heading = page.locator('h1');
    await expect(heading).toContainText('Prove an AI audit read the whole document');

    // Wait for initial sample review to load (Sample 1)
    await expect(page.locator('text=PASSED AUDIT')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('100.00%', { exact: true })).toBeVisible();

    // Verify coverage panel
    await expect(page.locator('text=On-Chain Consensus & Coverage Panel')).toBeVisible();
    await expect(page.locator('text=07319db20d11e985b14175a711e9a0f88bf1e7758f24aaabf21ff807c5f497a8')).toBeVisible();

    // Click Sample 3: Buried Trap Clause
    const sample3 = page.locator('text=Buried Trap Clause').first();
    await sample3.click();

    // Verify FAILED AUDIT banner
    await expect(page.locator('text=FAILED AUDIT')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=All subscriptions will auto-renew without notice')).toBeVisible();

    // Check honesty notes
    await expect(page.locator('text=On-Chain Consensus & Methodology Notes')).toBeVisible();
    await expect(page.locator('text=Consensus Scope on Failure Verdicts')).toBeVisible();

    // Verify no unhandled console errors
    expect(consoleErrors).toEqual([]);
  });

  test('responsive viewport check at 360px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('http://localhost:4173');

    // Verify header and brand are visible
    await expect(page.locator('header').getByText('Terms Audit Desk')).toBeVisible();
    await expect(page.locator('header').getByText('studionet')).toBeVisible();

    // Verify input is accessible
    const input = page.locator('#doc-url-input');
    await expect(input).toBeVisible();
  });
});
