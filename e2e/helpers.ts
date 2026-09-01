import { type Page } from '@playwright/test';

export async function selectAirline(
  page: Page,
  index: number,
  airlineSearch: string,
  optionText?: string,
) {
  const container = page.getByTestId(`segment-airline-${index}`);
  const input = container.locator('input');
  await input.click();
  await input.fill(airlineSearch);
  const targetOption = optionText || airlineSearch;
  await page.getByRole('option', { name: targetOption }).click();
}

export async function setAirport(page: Page, type: 'from' | 'to', index: number, iata: string) {
  const container = page.getByTestId(`segment-${type}-${index}`);
  const input = container.locator('input');
  await input.click();
  await input.fill(iata);
  // Wait for dropdown or press Tab/blur
  await input.press('Tab');
}

export async function setFareClass(
  page: Page,
  index: number,
  fareClass: string,
  isDropdown = false,
) {
  const container = page.getByTestId(`segment-fare-class-${index}`);
  const input = container.locator('input');
  if (isDropdown) {
    await input.click();
    await input.fill(fareClass);
    await page.getByRole('option', { name: fareClass }).first().click();
  } else {
    await input.fill(fareClass);
  }
}

export async function setEliteStatus(page: Page, status: string) {
  const container = page.getByTestId('elite-status-input');
  const input = container.locator('input');
  await input.click();
  await page.getByRole('option', { name: status, exact: true }).click();
}

export async function clickCalculate(page: Page) {
  await page.getByTestId('calculate-button').click();
}
