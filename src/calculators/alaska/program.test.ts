import { alaskaProgram } from "@/calculators/alaska";
import { buildSegment } from "@/test/testUtils";

describe("alaskaProgram", () => {
  it("describes Atmos Rewards", () => {
    expect(alaskaProgram.id).toBe("alaska");
    expect(alaskaProgram.currencies.airlinePoints.name).toBe("Atmos Points");
    expect(alaskaProgram.currencies.elitePoints.name).toBe("Status Points");
    expect(alaskaProgram.eliteTiers.map((tier) => tier.name)).toEqual([
      "Member",
      "Silver",
      "Gold",
      "Platinum",
      "Titanium",
    ]);
    expect(alaskaProgram.defaultEliteStatus).toBe("Member");
    expect(alaskaProgram.defaultAirline).toBe("as");
    expect(alaskaProgram.defaultOptions).toMatchObject({ earnMethod: "distance" });
  });

  it("offers Alaska, Hawaiian and partners in the airline dropdown", () => {
    const labels = alaskaProgram.airlineOptions.map((option) => option.airlineLabel);
    expect(labels).toEqual(
      expect.arrayContaining(["Alaska Airlines (as)", "Hawaiian Airlines (ha)", "Icelandair (fi)"])
    );
    expect(labels.some((label) => label.startsWith("undefined"))).toBe(false);
  });

  it("validates options and calculates through the program", async () => {
    expect(alaskaProgram.validateOptions!({ earnMethod: "price", fareUsd: 0 })).toHaveProperty(
      "fareUsd"
    );
    const result = await alaskaProgram.calculate([buildSegment("as", "", "sea", "lax")], "Member", {
      earnMethod: "distance",
    });
    expect(result.airlinePoints).toBe(954);
  });
});
