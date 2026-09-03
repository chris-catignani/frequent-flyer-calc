import {
  createSegmentInput,
  defaultSegmentInput,
  segmentInputToString,
  type SegmentInput,
} from "./segmentInput";
import type { Airport } from "@/types/airport";

const mockAirport: Airport = {
  iata: "SYD",
  name: "Sydney Airport",
  city: "Sydney",
  country: "Australia",
  latitude: -33.946,
  longitude: 151.177,
};

describe("SegmentInput model", () => {
  it("creates a segment input with positional arguments", () => {
    const input: SegmentInput = createSegmentInput("qf", "j", "syd", "mel", "custom-uuid");
    expect(input.airline).toBe("qf");
    expect(input.fareClass).toBe("j");
    expect(input.fromAirportText).toBe("syd");
    expect(input.toAirportText).toBe("mel");
    expect(input.uuid).toBe("custom-uuid");
    expect(input.fromAirport).toBeUndefined();
    expect(input.toAirport).toBeUndefined();
  });

  it("generates a uuid if none provided in positional arguments", () => {
    const input = createSegmentInput("qf", "j", "syd", "mel");
    expect(input.uuid).toBeTruthy();
    expect(typeof input.uuid).toBe("string");
  });

  it("creates a segment input with options object including airports", () => {
    const input = createSegmentInput({
      airline: "va",
      fareClass: "y",
      fromAirportText: "syd",
      toAirportText: "bne",
      fromAirport: mockAirport,
      toAirport: null,
    });
    expect(input.airline).toBe("va");
    expect(input.fareClass).toBe("y");
    expect(input.fromAirport).toBe(mockAirport);
    expect(input.toAirport).toBeNull();
  });

  it("provides a frozen defaultSegmentInput", () => {
    expect(defaultSegmentInput.airline).toBe("qf");
    expect(defaultSegmentInput.uuid).toBe("00000000-0000-0000-0000-000000000000");
    expect(Object.isFrozen(defaultSegmentInput)).toBe(true);
  });

  it("formats segmentInput to string correctly", () => {
    const input = createSegmentInput("qf", "j", "syd", "mel");
    expect(segmentInputToString(input)).toBe("qf j syd mel");
  });
});
