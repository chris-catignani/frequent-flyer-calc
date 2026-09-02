import {
  deleteAllSavedCalculations,
  deleteSavedCalculationAtIdx,
  getSavedCalculations,
  saveCalculation,
  setSavedCalculations,
} from "./recentCalculations";
import { SegmentInput } from "@/models/segmentInput";

describe("recentCalculations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when nothing is saved", () => {
    expect(getSavedCalculations()).toEqual([]);
  });

  it("saves and retrieves calculations with default storageKey", () => {
    const segments = [new SegmentInput("qf", "RedeDeal", "SYD", "MEL")];
    const saved = saveCalculation(segments, "one way", "Bronze");

    expect(saved).toHaveLength(1);
    expect(saved[0].eliteStatus).toBe("Bronze");
    expect(saved[0].tripType).toBe("one way");
    expect(saved[0].segmentInputs).toHaveLength(1);
    expect(saved[0].segmentInputs[0].airline).toBe("qf");

    const retrieved = getSavedCalculations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].eliteStatus).toBe("Bronze");
  });

  it("saves and retrieves calculations with custom storageKey", () => {
    const customKey = "saved-calculations-velocity";
    const segments = [new SegmentInput("va", "Elevate", "SYD", "BNE")];
    saveCalculation(segments, "return", "Gold", customKey);

    expect(getSavedCalculations()).toEqual([]);
    const retrievedCustom = getSavedCalculations(customKey);
    expect(retrievedCustom).toHaveLength(1);
    expect(retrievedCustom[0].eliteStatus).toBe("Gold");
    expect(retrievedCustom[0].tripType).toBe("return");
  });

  it("sets saved calculations directly using setSavedCalculations", () => {
    const segments = [new SegmentInput("qf", "Flex", "SYD", "MEL")];
    setSavedCalculations([
      { segmentInputs: segments, tripType: "return", eliteStatus: "Platinum" },
    ]);

    const retrieved = getSavedCalculations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].eliteStatus).toBe("Platinum");
  });

  it("deletes calculation at index", () => {
    const key = "saved-calculations";
    const seg1 = [new SegmentInput("qf", "Flex", "SYD", "MEL")];
    const seg2 = [new SegmentInput("qf", "Flex", "MEL", "BNE")];
    saveCalculation(seg1, "one way", "Bronze", key);
    saveCalculation(seg2, "one way", "Silver", key);

    expect(getSavedCalculations(key)).toHaveLength(2);

    deleteSavedCalculationAtIdx(0, key);
    const updated = getSavedCalculations(key);
    expect(updated).toHaveLength(1);
    expect(updated[0].eliteStatus).toBe("Bronze");
  });

  it("deletes all saved calculations", () => {
    const seg = [new SegmentInput("qf", "Flex", "SYD", "MEL")];
    saveCalculation(seg, "one way", "Bronze");
    expect(getSavedCalculations()).toHaveLength(1);

    deleteAllSavedCalculations();
    expect(getSavedCalculations()).toEqual([]);
  });

  it("handles out of bounds index deletion gracefully", () => {
    const seg = [new SegmentInput("qf", "Flex", "SYD", "MEL")];
    saveCalculation(seg, "one way", "Bronze");

    const result = deleteSavedCalculationAtIdx(5);
    expect(result).toHaveLength(1);
  });
});
