import { qantasProgram } from "@/app/_shared/calculators/qantas";
import { buildSegment } from "@/app/_shared/test/testUtils";

describe("qantasProgram adapter", () => {
  it("defines standard program metadata", () => {
    expect(qantasProgram.id).toBe("qantas");
    expect(qantasProgram.name).toBe("Qantas Frequent Flyer");
    expect(qantasProgram.defaultEliteStatus).toBe("Bronze");
    expect(qantasProgram.defaultAirline).toBe("qf");
    expect(qantasProgram.defaultFareClass).toBe("RedeDeal");
  });

  it("defines currencies", () => {
    expect(qantasProgram.currencies.airlinePoints.name).toBe("Qantas Points");
    expect(qantasProgram.currencies.airlinePoints.shortName).toBe("Points");
    expect(qantasProgram.currencies.elitePoints.name).toBe("Status Credits");
    expect(qantasProgram.currencies.elitePoints.shortName).toBe("Status Credits");
  });

  it("defines elite tiers", () => {
    const tierNames = qantasProgram.eliteTiers.map((tier) => tier.name);
    expect(tierNames).toEqual(["Bronze", "Silver", "Gold", "Platinum", "Platinum One"]);

    const silver = qantasProgram.eliteTiers.find((t) => t.id === "silver");
    expect(silver?.bonusMultiple).toBe(0.5);

    const gold = qantasProgram.eliteTiers.find((t) => t.id === "gold");
    expect(gold?.bonusMultiple).toBe(0.75);

    const platinum = qantasProgram.eliteTiers.find((t) => t.id === "platinum");
    expect(platinum?.bonusMultiple).toBe(1.0);
  });

  it("provides airline options and supported airlines", () => {
    expect(qantasProgram.supportedAirlines.has("qf")).toBe(true);
    expect(qantasProgram.supportedAirlines.has("aa")).toBe(true);
    expect(qantasProgram.supportedAirlines.has("jq")).toBe(true);
    expect(qantasProgram.supportedAirlines.has("zz")).toBe(false);

    expect(qantasProgram.airlineOptions.length).toBeGreaterThan(0);
    const qfOption = qantasProgram.airlineOptions.find((opt) => opt.iata === "qf");
    expect(qfOption?.airlineLabel).toBe("Qantas (qf)");
    expect(qfOption?.groupName).toBe("Qantas Group Airlines");
  });

  it("executes calculations through the adapter", async () => {
    const segment = buildSegment("qf", "RedeDeal", "SYD", "MEL");
    const result = await qantasProgram.calculate([segment], "Bronze");

    expect(result.containsErrors).toBe(false);
    expect(result.airlinePoints).toBe(800);
    expect(result.elitePoints).toBe(10);
    expect(result.segmentResults.length).toBe(1);
  });

  it("supports options object and elite bonuses in calculate", async () => {
    const segment = buildSegment("qf", "e", "syd", "sin");
    const result = await qantasProgram.calculate([segment], "Silver", 0, {
      compareWithProgramApi: false,
    });

    expect(result.containsErrors).toBe(false);
    expect(result.airlinePoints).toBe(3900); // 2600 base + 50% bonus = 3900
    expect(result.elitePoints).toBe(30);
  });
});
