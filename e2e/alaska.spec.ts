import { test, expect } from "@playwright/test";
import { clickCalculate, selectAirline, setAirport, setFareClass } from "./helpers";

test.describe("Atmos Rewards calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/alaska");
  });

  test("distance: AS SEA-LAX earns 1 point per mile", async ({ page }) => {
    await setAirport(page, "from", 0, "sea");
    await setAirport(page, "to", 0, "lax");
    await clickCalculate(page);

    await expect(page.getByTestId("total-points-earned")).toContainText("Atmos Points Earned: 954");
    await expect(page.getByTestId("total-status-credits-earned")).toContainText(
      "Status Points Earned: 954"
    );
  });

  test("price paid: Alaska-issued ticket earns 5 points per dollar", async ({ page }) => {
    await page.getByTestId("earn-method-price").click();
    await page.getByTestId("fare-usd-input").fill("500");
    await setAirport(page, "from", 0, "sea");
    await setAirport(page, "to", 0, "lax");
    await clickCalculate(page);

    await expect(page.getByTestId("total-points-earned")).toContainText("2,500");
    await expect(page.getByTestId("total-status-credits-earned")).toContainText("2,500");
  });

  test("price paid: other partner uses the fare-class cabin chart", async ({ page }) => {
    await page.getByTestId("earn-method-price").click();
    await page.getByTestId("ticket-issuer-select").selectOption("other");
    await page.getByTestId("fare-usd-input").fill("900");
    await selectAirline(page, 0, "Qatar Airways", "Qatar Airways (qr)");
    await setAirport(page, "from", 0, "doh");
    await setAirport(page, "to", 0, "lhr");
    await setFareClass(page, 0, "Q (Discount Economy)", true);
    await clickCalculate(page);

    await expect(page.getByTestId("total-points-earned")).toContainText("814");
    await expect(page.getByTestId("total-status-credits-earned")).toContainText("814");
  });

  test("deep link restores program options", async ({ page }) => {
    await page.goto(
      "/alaska?eliteStatus=Gold&tripType=one%20way&segmentInputs=as_sea_lax_&earnMethod=price&fareUsd=500"
    );
    await expect(page.getByTestId("earn-method-price")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("fare-usd-input")).toHaveValue("500");
    await clickCalculate(page);

    await expect(page.getByTestId("total-points-earned")).toContainText("3,750");
    await expect(page.getByTestId("total-status-credits-earned")).toContainText("2,500");
  });

  test("navigates between calculators", async ({ page }) => {
    await page.getByRole("link", { name: "Qantas" }).click();
    await expect(page).toHaveURL(/\/qantas/);
  });
});
