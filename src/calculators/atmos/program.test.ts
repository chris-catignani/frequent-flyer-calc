import { atmosProgram } from "@/calculators/atmos";
import { buildSegment } from "@/test/testUtils";

describe("atmosProgram", () => {
  it("describes Atmos Rewards", () => {
    expect(atmosProgram.id).toBe("atmos");
    expect(atmosProgram.currencies.airlinePoints.name).toBe("Atmos Points");
    expect(atmosProgram.currencies.elitePoints.name).toBe("Status Points");
    expect(atmosProgram.eliteTiers.map((tier) => tier.name)).toEqual([
      "Member",
      "Silver",
      "Gold",
      "Platinum",
      "Titanium",
    ]);
    expect(atmosProgram.defaultEliteStatus).toBe("Member");
    expect(atmosProgram.defaultAirline).toBe("as");
    expect(atmosProgram.defaultOptions).toMatchObject({ earnMethod: "distance" });
  });

  it("offers Alaska, Hawaiian and partners in the airline dropdown", () => {
    const labels = atmosProgram.airlineOptions.map((option) => option.airlineLabel);
    expect(labels).toEqual(
      expect.arrayContaining(["Alaska Airlines (as)", "Hawaiian Airlines (ha)", "Icelandair (fi)"])
    );
    expect(labels.some((label) => label.startsWith("undefined"))).toBe(false);
  });

  it("validates options and calculates through the program", async () => {
    expect(atmosProgram.validateOptions!({ earnMethod: "price", fareUsd: 0 })).toHaveProperty(
      "fareUsd"
    );
    const result = await atmosProgram.calculate([buildSegment("as", "", "sea", "lax")], "Member", {
      earnMethod: "distance",
    });
    expect(result.airlinePoints).toBe(954);
  });
});
