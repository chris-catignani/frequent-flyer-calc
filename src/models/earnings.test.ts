import { createEarnings, type Earnings } from "./earnings";

describe("Earnings model", () => {
  it("creates an earnings object with readonly airlinePoints and elitePoints", () => {
    const earnings: Earnings = createEarnings(1200, 30);
    expect(earnings.airlinePoints).toBe(1200);
    expect(earnings.elitePoints).toBe(30);
  });

  it("is a plain object and not an instance of a class", () => {
    const earnings = createEarnings(500, 10);
    expect(Object.getPrototypeOf(earnings)).toBe(Object.prototype);
  });
});
