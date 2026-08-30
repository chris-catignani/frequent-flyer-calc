import { test, expect } from '@playwright/test';
import { selectAirline, setAirport, setFareClass, setEliteStatus, clickCalculate } from './helpers';

test.describe('Controls, Dynamic Recalculation & URL Hydration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qantas');
  });

  test('dynamically recalculates when toggling Return trip type', async ({ page }) => {
    await selectAirline(page, 0, 'Qantas', 'Qantas (qf)');
    await setAirport(page, 'from', 0, 'syd');
    await setAirport(page, 'to', 0, 'mel');
    await setFareClass(page, 0, 'Flex', true);
    await clickCalculate(page);

    await expect(page.getByTestId('total-points-earned')).toContainText('1,200');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('20');

    // Toggle Return trip type
    await page.getByTestId('trip-type-return').click();

    // Verify automatic recalculation doubles the points/credits and shows 2 rows
    await expect(page.getByTestId('total-points-earned')).toContainText('2,400');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('40');
    await expect(page.locator('[data-testid^="segment-result-row-"]')).toHaveCount(2);
    await expect(page.getByTestId('segment-result-route-0')).toContainText('syd - mel');
    await expect(page.getByTestId('segment-result-route-1')).toContainText('mel - syd');
  });

  test('dynamically recalculates points when changing elite status', async ({ page }) => {
    await selectAirline(page, 0, 'Qantas', 'Qantas (qf)');
    await setAirport(page, 'from', 0, 'syd');
    await setAirport(page, 'to', 0, 'mel');
    await setFareClass(page, 0, 'Flex', true);
    await clickCalculate(page);

    await expect(page.getByTestId('total-points-earned')).toContainText('1,200');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('20');

    // Switch to Platinum
    await setEliteStatus(page, 'Platinum');

    // Base 750 + 100% Platinum bonus 750 = 1,500 points
    await expect(page.getByTestId('total-points-earned')).toContainText('1,500');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('20');
  });

  test('hydrates form inputs from URL query parameters', async ({ page }) => {
    await page.goto('/qantas?segmentInputs=qf_syd_mel_y&tripType=return&eliteStatus=Gold');

    await expect(page.getByTestId('trip-type-return')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('elite-status-input').locator('input')).toHaveValue('Gold');
    await expect(page.getByTestId('segment-from-0').locator('input')).toHaveValue('SYD');
    await expect(page.getByTestId('segment-to-0').locator('input')).toHaveValue('MEL');
  });

  test('saves and restores inputs via recent calculations history', async ({ page }) => {
    await selectAirline(page, 0, 'Qantas', 'Qantas (qf)');
    await setAirport(page, 'from', 0, 'syd');
    await setAirport(page, 'to', 0, 'mel');
    await setFareClass(page, 0, 'Flex', true);
    await clickCalculate(page);

    // Expand recent calculations
    await page.getByTestId('recent-calculations-toggle').click();
    await expect(page.getByTestId('recent-calculation-chip-0')).toBeVisible();

    // Change destination input
    await setAirport(page, 'to', 0, 'bne');
    await expect(page.getByTestId('segment-to-0').locator('input')).toHaveValue('BNE');

    // Click recent calculation chip to restore
    await page.getByTestId('recent-calculation-chip-0').click();
    await expect(page.getByTestId('segment-to-0').locator('input')).toHaveValue('MEL');
  });
});
