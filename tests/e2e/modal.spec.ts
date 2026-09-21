import { test, expect } from '@playwright/test';

test.describe('Terms Audit Desk - Interactive Modals', () => {
  test('opens and navigates About modal', async ({ page }) => {
    await page.goto('http://localhost:4173');

    // Click "How It Works" button via accessible name
    await page.getByRole('button', { name: /About Terms Audit Desk and methodology/i }).click();

    // Verify modal visible
    await expect(page.getByRole('heading', { name: 'How Terms Audit Desk Works' })).toBeVisible();
    await expect(page.getByText('The Buried-Clause Vulnerability')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByRole('heading', { name: 'How Terms Audit Desk Works' })).not.toBeVisible();
  });

  test('opens Custom Checklist modal and previews derived ID', async ({ page }) => {
    await page.goto('http://localhost:4173');

    // Click "+ Custom" button
    await page.getByRole('button', { name: /\+ Custom/i }).click();

    // Verify modal visible
    await expect(page.getByRole('heading', { name: 'Create Custom Evaluation Checklist' })).toBeVisible();

    // Check preview checklist ID is visible
    const idContainer = page.locator('text=Derived Checklist ID (SHA-256):').locator('..').locator('..');
    await expect(idContainer).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close dialog' }).click();
  });
});
