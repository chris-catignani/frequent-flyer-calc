import { test, expect } from '@playwright/test';
import { selectAirline, setAirport, setFareClass, clickCalculate } from './helpers';

test.describe('Simple Routes Calculation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qantas');
  });

  test('calculates partner route: AA LAX to JFK in First class', async ({ page }) => {
    await selectAirline(page, 0, 'American Airlines', 'American Airlines (aa)');
    await setAirport(page, 'from', 0, 'lax');
    await setAirport(page, 'to', 0, 'jfk');
    await setFareClass(page, 0, 'f');
    await clickCalculate(page);

    await expect(page.getByTestId('total-points-earned')).toContainText('3,750');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('150');
  });

  test('calculates domestic Qantas route: QF SYD to MEL in Discount Economy', async ({ page }) => {
    await setAirport(page, 'from', 0, 'syd');
    await setAirport(page, 'to', 0, 'mel');
    await setFareClass(page, 0, 'Red e-Deal', true);
    await clickCalculate(page);

    await expect(page.getByTestId('total-points-earned')).toContainText('800');
    await expect(page.getByTestId('total-status-credits-earned')).toContainText('10');
  });
});
