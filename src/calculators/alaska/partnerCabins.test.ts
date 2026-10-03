import {
  getPartnerCabin,
  getPartnerFareClasses,
  parsePartnerCabinTable,
} from "@/calculators/alaska/partnerCabins";

describe("partner cabin table", () => {
  it("maps letter fare classes case-insensitively", () => {
    expect(getPartnerCabin("qr", "Q")?.cabin).toBe("discountEconomy");
    expect(getPartnerCabin("qr", "q")?.cabin).toBe("discountEconomy");
    expect(getPartnerCabin("jl", "f")?.cabin).toBe("first");
    expect(getPartnerCabin("aa", "w")?.cabin).toBe("premiumEconomy");
  });

  it("tolerates the stray space in Porter's 'N ,K'", () => {
    expect(getPartnerCabin("pd", "n")?.cabin).toBe("economy");
    expect(getPartnerCabin("pd", "k")?.cabin).toBe("economy");
  });

  it("parses Icelandair fare types into space-free ids", () => {
    expect(getPartnerCabin("fi", "standardeconomy")).toEqual({
      id: "standardeconomy",
      label: "Standard Economy",
      cabin: "discountEconomy",
    });
    expect(getPartnerCabin("fi", "sagapremiumflex")?.cabin).toBe("business");
  });

  it("returns nothing for unknown airlines or fare classes", () => {
    expect(getPartnerFareClasses("as")).toEqual([]);
    expect(getPartnerCabin("qr", "z")).toBeUndefined();
    expect(getPartnerCabin("qr", "")).toBeUndefined();
  });

  it("keeps table order so fare classes are grouped by cabin", () => {
    const cabins = getPartnerFareClasses("ba").map((fareClass) => fareClass.cabin);
    expect([...new Set(cabins)]).toEqual([
      "discountEconomy",
      "economy",
      "premiumEconomy",
      "business",
      "first",
    ]);
  });

  it("rejects unknown airlines, cabins, and duplicate fare classes", () => {
    expect(() => parsePartnerCabinTable("Nope Air\tEcon\tY", {})).toThrow("Unrecognised");
    expect(() => parsePartnerCabinTable("Condor\tCoach\tY", { Condor: "de" })).toThrow(
      "Unrecognised"
    );
    expect(() =>
      parsePartnerCabinTable("Condor\tEcon\tY\nCondor\tBusiness\tY", { Condor: "de" })
    ).toThrow("Duplicate");
  });
});
