import {
  deleteAllSavedCalculations,
  deleteSavedCalculationAtIdx,
  getSavedCalculations,
  saveCalculation,
  setSavedCalculations,
} from "./recentCalculations";
import { createSegmentInput } from "@/models/segmentInput";

describe("recentCalculations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when nothing is saved", () => {
    expect(getSavedCalculations()).toEqual([]);
  });

  it("saves and retrieves calculations with default storageKey", () => {
    const segments = [createSegmentInput("qf", "RedeDeal", "SYD", "MEL")];
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
    const segments = [createSegmentInput("va", "Elevate", "SYD", "BNE")];
    saveCalculation(segments, "return", "Gold", customKey);

    expect(getSavedCalculations()).toEqual([]);
    const retrievedCustom = getSavedCalculations(customKey);
    expect(retrievedCustom).toHaveLength(1);
    expect(retrievedCustom[0].eliteStatus).toBe("Gold");
    expect(retrievedCustom[0].tripType).toBe("return");
  });

  it("sets saved calculations directly using setSavedCalculations", () => {
    const segments = [createSegmentInput("qf", "Flex", "SYD", "MEL")];
    setSavedCalculations([
      { segmentInputs: segments, tripType: "return", eliteStatus: "Platinum" },
    ]);

    const retrieved = getSavedCalculations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].eliteStatus).toBe("Platinum");
  });

  it("deletes calculation at index", () => {
    const key = "saved-calculations";
    const seg1 = [createSegmentInput("qf", "Flex", "SYD", "MEL")];
    const seg2 = [createSegmentInput("qf", "Flex", "MEL", "BNE")];
    saveCalculation(seg1, "one way", "Bronze", key);
    saveCalculation(seg2, "one way", "Silver", key);

    expect(getSavedCalculations(key)).toHaveLength(2);

    deleteSavedCalculationAtIdx(0, key);
    const updated = getSavedCalculations(key);
    expect(updated).toHaveLength(1);
    expect(updated[0].eliteStatus).toBe("Bronze");
  });

  it("deletes all saved calculations", () => {
    const seg = [createSegmentInput("qf", "Flex", "SYD", "MEL")];
    saveCalculation(seg, "one way", "Bronze");
    expect(getSavedCalculations()).toHaveLength(1);

    deleteAllSavedCalculations();
    expect(getSavedCalculations()).toEqual([]);
  });

  it("handles out of bounds index deletion gracefully", () => {
    const seg = [createSegmentInput("qf", "Flex", "SYD", "MEL")];
    saveCalculation(seg, "one way", "Bronze");

    const result = deleteSavedCalculationAtIdx(5);
    expect(result).toHaveLength(1);
  });

  describe("error handling and resilience", () => {
    it("returns empty array and clears storage when corrupted JSON is in localStorage", () => {
      localStorage.setItem("saved-calculations", "invalid-json{");
      const result = getSavedCalculations();
      expect(result).toEqual([]);
      expect(localStorage.getItem("saved-calculations")).toBeNull();
    });

    it("returns empty array and clears storage when stored value is not an array", () => {
      localStorage.setItem("saved-calculations", JSON.stringify({ notAnArray: true }));
      expect(getSavedCalculations()).toEqual([]);
      expect(localStorage.getItem("saved-calculations")).toBeNull();

      localStorage.setItem("saved-calculations", "123");
      expect(getSavedCalculations()).toEqual([]);
      expect(localStorage.getItem("saved-calculations")).toBeNull();

      localStorage.setItem("saved-calculations", "true");
      expect(getSavedCalculations()).toEqual([]);
      expect(localStorage.getItem("saved-calculations")).toBeNull();
    });

    it("filters out null, malformed, or empty segment entries and validates string types", () => {
      const malformedData = [
        null,
        {},
        { segmentInputs: [], tripType: "one way", eliteStatus: "Bronze" }, // empty segments should be skipped
        { segmentInputs: "not an array", tripType: "one way", eliteStatus: "Bronze" },
        {
          // non-string properties should be converted safely to string without crashing
          segmentInputs: [
            { airline: 123, fareClass: {}, fromAirportText: null, toAirportText: false, uuid: 456 },
          ],
          tripType: "one way",
          eliteStatus: "Bronze",
        },
        {
          segmentInputs: [
            { airline: "qf", fareClass: "Flex", fromAirportText: "SYD", toAirportText: "MEL" },
          ],
          tripType: "return",
          eliteStatus: "Silver",
        },
      ];
      localStorage.setItem("saved-calculations", JSON.stringify(malformedData));

      const result = getSavedCalculations();
      expect(result).toHaveLength(2);
      expect(result[0].segmentInputs[0].airline).toBe("");
      expect(result[0].segmentInputs[0].fareClass).toBe("");
      expect(result[0].segmentInputs[0].fromAirportText).toBe("");
      expect(result[0].segmentInputs[0].toAirportText).toBe("");
      expect(typeof result[0].segmentInputs[0].uuid).toBe("string");

      expect(result[1].eliteStatus).toBe("Silver");
      expect(result[1].segmentInputs).toHaveLength(1);
    });

    it("handles QuotaExceededError on saveCalculation gracefully", () => {
      const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        const error = new Error("Quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      });

      const segments = [createSegmentInput("qf", "Flex", "SYD", "MEL")];
      expect(() => {
        const saved = saveCalculation(segments, "one way", "Bronze");
        expect(saved).toHaveLength(1);
        expect(saved[0].eliteStatus).toBe("Bronze");
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it("handles localStorage.getItem throwing SecurityError gracefully", () => {
      const getItemSpy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        const error = new Error("Security error");
        error.name = "SecurityError";
        throw error;
      });

      expect(() => {
        const result = getSavedCalculations();
        expect(result).toEqual([]);
      }).not.toThrow();

      getItemSpy.mockRestore();
    });

    it("handles localStorage.removeItem throwing gracefully in deleteAllSavedCalculations", () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Access denied");
      });

      expect(() => {
        const result = deleteAllSavedCalculations();
        expect(result).toEqual([]);
      }).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });
});
