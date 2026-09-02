import {
  POINTS_TOLERANCE_PER_SEGMENT,
  isAirlinePointsMatch,
  isElitePointsMatch,
  isClosePointsMatch,
} from "./comparison";

describe("comparison utilities", () => {
  describe("POINTS_TOLERANCE_PER_SEGMENT", () => {
    it("is defined as 1", () => {
      expect(POINTS_TOLERANCE_PER_SEGMENT).toBe(1);
    });
  });

  describe("isAirlinePointsMatch", () => {
    it("returns true for exact matches", () => {
      expect(isAirlinePointsMatch(1000, 1000)).toBe(true);
    });

    it("returns true within default tolerance of ±1", () => {
      expect(isAirlinePointsMatch(1000, 1001)).toBe(true);
      expect(isAirlinePointsMatch(1001, 1000)).toBe(true);
      expect(isAirlinePointsMatch(1000, 999)).toBe(true);
    });

    it("returns false when exceeding tolerance", () => {
      expect(isAirlinePointsMatch(1000, 1002)).toBe(false);
      expect(isAirlinePointsMatch(1000, 998)).toBe(false);
    });

    it("supports custom tolerance", () => {
      expect(isAirlinePointsMatch(1000, 1003, 3)).toBe(true);
      expect(isAirlinePointsMatch(1000, 1004, 3)).toBe(false);
    });
  });

  describe("isElitePointsMatch", () => {
    it("returns true for exact match", () => {
      expect(isElitePointsMatch(20, 20)).toBe(true);
    });

    it("returns false for any difference", () => {
      expect(isElitePointsMatch(20, 21)).toBe(false);
      expect(isElitePointsMatch(20, 19)).toBe(false);
    });
  });

  describe("isClosePointsMatch", () => {
    it("returns false for exact match", () => {
      expect(isClosePointsMatch(1000, 1000)).toBe(false);
    });

    it("returns true within tolerance", () => {
      expect(isClosePointsMatch(1000, 1001)).toBe(true);
      expect(isClosePointsMatch(1001, 1000)).toBe(true);
      expect(isClosePointsMatch(1000, 999)).toBe(true);
    });

    it("returns false outside tolerance", () => {
      expect(isClosePointsMatch(1000, 1002)).toBe(false);
      expect(isClosePointsMatch(1000, 998)).toBe(false);
    });

    it("supports custom tolerance", () => {
      expect(isClosePointsMatch(1000, 1003, 3)).toBe(true);
      expect(isClosePointsMatch(1000, 1004, 3)).toBe(false);
    });
  });
});
