import { test, expect } from '@playwright/test';
import { clickCalculate } from './helpers';

test.describe('Advanced Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qantas');
  });

  test('parses and applies free-form text itinerary', async ({ page }) => {
    // 1. Expand Advanced Input
    await page.getByTestId('advanced-input-toggle').click();

    // 2. Expand Free Form Text Itinerary
    await page.getByTestId('advanced-input-text-accordion').click();

    // 3. Fill text field with multi-segment itinerary
    const textField = page.getByTestId('advanced-input-text-field').getByRole('textbox');
    await textField.fill('qf syd mel y\nqf mel bne y');

    // 4. Click Apply
    await page.getByTestId('advanced-input-text-apply-button').click();

    // 5. Verify segment rows populate (SYD -> MEL and MEL -> BNE)
    await expect(page.locator('[data-testid^="segment-row-"]')).toHaveCount(2);
    await expect(page.getByTestId('segment-from-0').locator('input')).toHaveValue('SYD');
    await expect(page.getByTestId('segment-to-0').locator('input')).toHaveValue('MEL');
    await expect(page.getByTestId('segment-from-1').locator('input')).toHaveValue('MEL');
    await expect(page.getByTestId('segment-to-1').locator('input')).toHaveValue('BNE');

    // 6. Click Calculate
    await clickCalculate(page);

    // 7. Verify summary points: 2,575, status credits: 50, and 2 result breakdown rows
    await expect(page.getByTestId('total-points-earned')).toContainText('2,575');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('50');
    await expect(page.locator('[data-testid^="segment-result-row-"]')).toHaveCount(2);
    await expect(page.getByTestId('segment-result-route-0')).toContainText('syd - mel');
    await expect(page.getByTestId('segment-result-route-1')).toContainText('mel - bne');
  });
});
