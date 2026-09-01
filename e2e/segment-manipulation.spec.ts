import { test, expect } from '@playwright/test';
import { selectAirline, setAirport, setFareClass, clickCalculate } from './helpers';

test.describe('Segment Manipulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qantas');
  });

  test('adds, populates, calculates, deletes, and recalculates segments', async ({ page }) => {
    // 1. Populate Segment 0: QF, SYD -> MEL, Flexible Economy
    await selectAirline(page, 0, 'Qantas', 'Qantas (qf)');
    await setAirport(page, 'from', 0, 'syd');
    await setAirport(page, 'to', 0, 'mel');
    await setFareClass(page, 0, 'Flex', true);

    // 2. Click "Add Segment"
    await page.getByTestId('add-segment-button').click();

    // 3. Verify Segment 1 auto-fills origin MEL
    await expect(page.getByTestId('segment-from-1').locator('input')).toHaveValue('MEL');

    // 4. Populate Segment 1: QF, MEL -> BNE, Flexible Economy
    await setAirport(page, 'to', 1, 'bne');
    await setFareClass(page, 1, 'Flex', true);

    // 5. Click "Calculate". Verify aggregate points: 2,575, status credits: 50, and 2 segment rows
    await clickCalculate(page);
    await expect(page.getByTestId('total-points-earned')).toContainText('2,575');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('50');
    await expect(page.locator('[data-testid^="segment-result-row-"]')).toHaveCount(2);
    await expect(page.getByTestId('segment-result-route-0')).toContainText('syd - mel');
    await expect(page.getByTestId('segment-result-route-1')).toContainText('mel - bne');

    // 6. Click delete button on Segment 0
    await page.getByTestId('segment-delete-0').click();

    // 7. Verify only 1 segment remains (MEL -> BNE)
    await expect(page.locator('[data-testid^="segment-row-"]')).toHaveCount(1);
    await expect(page.getByTestId('segment-from-0').locator('input')).toHaveValue('MEL');
    await expect(page.getByTestId('segment-to-0').locator('input')).toHaveValue('BNE');

    // 8. Click "Calculate". Verify updated points: 1,375, status credits: 30
    await clickCalculate(page);
    await expect(page.getByTestId('total-points-earned')).toContainText('1,375');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('30');
    await expect(page.locator('[data-testid^="segment-result-row-"]')).toHaveCount(1);
    await expect(page.getByTestId('segment-result-route-0')).toContainText('mel - bne');
  });
});
