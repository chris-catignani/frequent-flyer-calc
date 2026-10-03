import {
  DEFAULT_ATMOS_OPTIONS,
  requiresFareClass,
  toAtmosOptions,
  usesRevenueEarning,
  validateAtmosOptions,
} from "@/calculators/alaska/options";

describe("toAtmosOptions", () => {
  it("fills defaults", () => {
    expect(toAtmosOptions({})).toEqual(DEFAULT_ATMOS_OPTIONS);
  });

  it("keeps valid values and replaces invalid ones with defaults", () => {
    expect(
      toAtmosOptions({
        earnMethod: "price",
        bookingType: "nonsense",
        ticketIssuer: "other",
        fareUsd: 250,
        pointsRedeemed: -5,
        globalLocals: true,
      })
    ).toEqual({
      earnMethod: "price",
      bookingType: "cash",
      ticketIssuer: "other",
      fareUsd: 250,
      pointsRedeemed: 0,
      globalLocals: true,
    });
  });
});

describe("validateAtmosOptions", () => {
  it("requires a fare for price + cash", () => {
    expect(validateAtmosOptions({ earnMethod: "price", bookingType: "cash", fareUsd: 0 })).toEqual({
      fareUsd: "Enter the fare paid",
    });
  });

  it("requires points redeemed for price + award", () => {
    expect(
      validateAtmosOptions({ earnMethod: "price", bookingType: "award", pointsRedeemed: 0 })
    ).toEqual({ pointsRedeemed: "Enter the points redeemed" });
  });

  it("needs nothing extra for distance or segments", () => {
    expect(validateAtmosOptions({ earnMethod: "distance" })).toEqual({});
    expect(validateAtmosOptions({ earnMethod: "segments", bookingType: "award" })).toEqual({});
  });
});

describe("usesRevenueEarning", () => {
  it("is true for Alaska-issued tickets on any airline", () => {
    expect(usesRevenueEarning("qr", "alaska")).toBe(true);
  });
  it("is true only for American flights on American-issued tickets", () => {
    expect(usesRevenueEarning("aa", "american")).toBe(true);
    expect(usesRevenueEarning("ba", "american")).toBe(false);
  });
  it("is false for other issuers", () => {
    expect(usesRevenueEarning("aa", "other")).toBe(false);
  });
});

describe("requiresFareClass", () => {
  const priceCash = { ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price" as const };

  it("is only required for chart-based partner flights", () => {
    expect(requiresFareClass("qr", { ...priceCash, ticketIssuer: "other" })).toBe(true);
    expect(requiresFareClass("ba", { ...priceCash, ticketIssuer: "american" })).toBe(true);
    expect(requiresFareClass("qr", priceCash)).toBe(false);
    expect(requiresFareClass("as", { ...priceCash, ticketIssuer: "other" })).toBe(false);
    expect(
      requiresFareClass("qr", { ...priceCash, ticketIssuer: "other", bookingType: "award" })
    ).toBe(false);
    expect(requiresFareClass("qr", { ...DEFAULT_ATMOS_OPTIONS, ticketIssuer: "other" })).toBe(
      false
    );
  });
});
