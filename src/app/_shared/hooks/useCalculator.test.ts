import { renderHook, act } from "@testing-library/react";
import posthog from "posthog-js";
import { useCalculator } from "./useCalculator";
import type { FrequentFlyerProgram } from "@/types/program";
import { SegmentInput } from "@/app/_shared/models/segmentInput";

// Mock posthog-js
jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

// Mock Next.js useSearchParams
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
    toString: () => "",
  }),
}));

const mockProgram: FrequentFlyerProgram = {
  id: "test-program",
  name: "Test Frequent Flyer",
  currencies: {
    airlinePoints: { name: "Points", shortName: "Pts" },
    elitePoints: { name: "Credits", shortName: "SC" },
  },
  eliteTiers: [
    { id: "bronze", name: "Bronze" },
    { id: "silver", name: "Silver" },
    { id: "gold", name: "Gold" },
  ],
  defaultEliteStatus: "Bronze",
  defaultAirline: "tp",
  defaultFareClass: "Economy",
  supportedAirlines: new Set(["tp", "qf"]),
  airlineOptions: [
    { id: "tp", iata: "tp", airlineLabel: "Test Airline (tp)", groupName: "Test Group" },
    { id: "qf", iata: "qf", airlineLabel: "Qantas (qf)", groupName: "Test Group" },
  ],
  calculate: jest.fn().mockResolvedValue({
    segmentResults: [],
    containsErrors: false,
    airlinePoints: 1000,
    elitePoints: 20,
  }),
};

describe("useCalculator", () => {
  beforeEach(() => {
    localStorage.clear();
    mockGet.mockReturnValue(null);
    jest.clearAllMocks();
    (mockProgram.calculate as jest.Mock).mockResolvedValue({
      segmentResults: [],
      containsErrors: false,
      airlinePoints: 1000,
      elitePoints: 20,
    });
  });

  it("initializes with program defaults", () => {
    const { result } = renderHook(() => useCalculator({ program: mockProgram }));

    expect(result.current.eliteStatus).toBe("Bronze");
    expect(result.current.tripType).toBe("one way");
    expect(result.current.compareWithProgramApi).toBe(false);
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.calculationOutput).toBeNull();
    expect(result.current.inputErrors).toEqual({});
    expect(result.current.savedCalculations).toEqual([]);
    expect(result.current.segmentInputs).toHaveLength(1);
    expect(result.current.segmentInputs[0].airline).toBe("tp");
    expect(result.current.segmentInputs[0].fareClass).toBe("Economy");
  });

  describe("segment manipulations", () => {
    it("adds a segment inheriting previous segment airline and destination airport", () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      act(() => {
        result.current.addSegment();
      });

      expect(result.current.segmentInputs).toHaveLength(2);
      expect(result.current.segmentInputs[1].airline).toBe("tp");
      expect(result.current.segmentInputs[1].fromAirportText).toBe("MEL");
      expect(result.current.segmentInputs[1].toAirportText).toBe("");
    });

    it("deletes a segment and resets calculationOutput", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.addSegment();
      });
      expect(result.current.segmentInputs).toHaveLength(2);

      act(() => {
        result.current.deleteSegment(0);
      });

      expect(result.current.segmentInputs).toHaveLength(1);
      expect(result.current.calculationOutput).toBeNull();
    });

    it("updates a segment, resolves 3-letter IATA airports, and resets calculationOutput", () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      expect(result.current.segmentInputs[0].fromAirport).toBeDefined();
      expect(result.current.segmentInputs[0].fromAirport?.iata).toBe("SYD");
      expect(result.current.segmentInputs[0].toAirport).toBeDefined();
      expect(result.current.segmentInputs[0].toAirport?.iata).toBe("MEL");
      expect(result.current.calculationOutput).toBeNull();
    });

    it("reorders segments and resets calculationOutput", () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
        result.current.addSegment();
      });

      act(() => {
        result.current.updateSegment(1, new SegmentInput("qf", "Flex", "MEL", "BNE"));
      });

      expect(result.current.segmentInputs[0].airline).toBe("tp");
      expect(result.current.segmentInputs[1].airline).toBe("qf");

      act(() => {
        result.current.reorderSegments(0, 1);
      });

      expect(result.current.segmentInputs[0].airline).toBe("qf");
      expect(result.current.segmentInputs[1].airline).toBe("tp");
    });

    it("bulk updates segment inputs and resolves airport objects", () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      const newInputs = [
        new SegmentInput("tp", "Economy", "SYD", "MEL"),
        new SegmentInput("qf", "Flex", "MEL", "PER"),
      ];

      act(() => {
        result.current.setAllSegmentInputs(newInputs);
      });

      expect(result.current.segmentInputs).toHaveLength(2);
      expect(result.current.segmentInputs[0].fromAirport?.iata).toBe("SYD");
      expect(result.current.segmentInputs[1].toAirport?.iata).toBe("PER");
    });
  });

  describe("calculation and dynamic recalculation", () => {
    it("sets input errors when validation fails", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      // Default segment has no from/to airport
      await act(async () => {
        await result.current.calculate();
      });

      expect(Object.keys(result.current.inputErrors).length).toBeGreaterThan(0);
      expect(result.current.calculationOutput).toBeNull();
      expect(mockProgram.calculate).not.toHaveBeenCalled();
    });

    it("executes calculation on valid inputs and records history & analytics", async () => {
      const pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {});

      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(mockProgram.calculate).toHaveBeenCalledTimes(1);
      expect(result.current.calculationOutput).toEqual({
        segmentResults: [],
        containsErrors: false,
        airlinePoints: 1000,
        elitePoints: 20,
      });
      expect(posthog.capture).toHaveBeenCalledWith(
        "calculation_completed",
        expect.objectContaining({
          trip_type: "one way",
          elite_status: "Bronze",
          total_points: 1000,
          total_status_credits: 20,
        })
      );
      expect(pushStateSpy).toHaveBeenCalled();
      expect(result.current.savedCalculations).toHaveLength(1);
    });

    it("expands return segments when tripType is return", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.setTripType("return");
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(mockProgram.calculate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            fromAirport: expect.objectContaining({ iata: "SYD" }),
            toAirport: expect.objectContaining({ iata: "MEL" }),
          }),
          expect.objectContaining({
            fromAirport: expect.objectContaining({ iata: "MEL" }),
            toAirport: expect.objectContaining({ iata: "SYD" }),
          }),
        ]),
        "Bronze",
        0.0,
        false
      );
    });

    it("dynamically recalculates when eliteStatus changes after successful calculation", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(mockProgram.calculate).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setEliteStatus("Gold");
      });

      expect(result.current.eliteStatus).toBe("Gold");
      expect(mockProgram.calculate).toHaveBeenCalledTimes(2);
      expect(mockProgram.calculate).toHaveBeenLastCalledWith(expect.any(Array), "Gold", 0.0, false);
    });

    it("dynamically recalculates when tripType changes after successful calculation", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(mockProgram.calculate).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setTripType("return");
      });

      expect(result.current.tripType).toBe("return");
      expect(mockProgram.calculate).toHaveBeenCalledTimes(2);
    });

    it("dynamically recalculates when compareWithProgramApi toggles after successful calculation", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(mockProgram.calculate).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setCompareWithProgramApi(true);
      });

      expect(result.current.compareWithProgramApi).toBe(true);
      expect(mockProgram.calculate).toHaveBeenCalledTimes(2);
      expect(mockProgram.calculate).toHaveBeenLastCalledWith(
        expect.any(Array),
        "Bronze",
        0.0,
        true
      );
    });

    it("discards stale out-of-order calculation responses", async () => {
      let resolveFirst: (val: import("@/types/calculator").CalculationResult) => void;
      let resolveSecond: (val: import("@/types/calculator").CalculationResult) => void;

      (mockProgram.calculate as jest.Mock)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFirst = resolve;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = resolve;
            })
        );

      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      // Start first calculation
      let firstPromise: Promise<void>;
      act(() => {
        firstPromise = result.current.calculate();
      });

      // Start second calculation
      let secondPromise: Promise<void>;
      act(() => {
        secondPromise = result.current.calculate();
      });

      // Resolve second (newer) first
      await act(async () => {
        resolveSecond!({
          segmentResults: [],
          containsErrors: false,
          airlinePoints: 2000,
          elitePoints: 40,
        });
        await secondPromise;
      });

      expect(result.current.calculationOutput?.airlinePoints).toBe(2000);

      // Now resolve first (older)
      await act(async () => {
        resolveFirst!({
          segmentResults: [],
          containsErrors: false,
          airlinePoints: 1000,
          elitePoints: 20,
        });
        await firstPromise;
      });

      // It should NOT have overwritten the second result with 1000
      expect(result.current.calculationOutput?.airlinePoints).toBe(2000);
    });
  });

  describe("recent calculations operations", () => {
    it("loads, deletes and clears recent calculations", async () => {
      const { result } = renderHook(() => useCalculator({ program: mockProgram }));

      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "SYD", "MEL"));
      });

      await act(async () => {
        await result.current.calculate();
      });

      expect(result.current.savedCalculations).toHaveLength(1);

      // Reset segment and load recent
      act(() => {
        result.current.updateSegment(0, new SegmentInput("tp", "Economy", "BNE", "PER"));
      });
      expect(result.current.segmentInputs[0].fromAirportText).toBe("BNE");

      act(() => {
        result.current.loadRecentCalculation(0);
      });
      expect(result.current.segmentInputs[0].fromAirportText).toBe("SYD");

      act(() => {
        result.current.deleteRecentCalculation(0);
      });
      expect(result.current.savedCalculations).toHaveLength(0);

      // Save again and clear all
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.savedCalculations).toHaveLength(1);

      act(() => {
        result.current.clearAllRecentCalculations();
      });
      expect(result.current.savedCalculations).toHaveLength(0);
    });
  });
});
