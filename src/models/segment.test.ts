import { createSegment, segmentToString, type Segment } from "./segment";
import type { Airport } from "@/types/airport";

const mockAirport1: Airport = {
  iata: "SYD",
  name: "Sydney Kingsford Smith Airport",
  city: "Sydney",
  country: "Australia",
  latitude: -33.946,
  longitude: 151.177,
};

const mockAirport2: Airport = {
  iata: "MEL",
  name: "Melbourne Airport",
  city: "Melbourne",
  country: "Australia",
  latitude: -37.673,
  longitude: 144.843,
};

describe("Segment model", () => {
  it("creates a segment using positional arguments", () => {
    const segment: Segment = createSegment("qf", "y", mockAirport1, mockAirport2);
    expect(segment.airline).toBe("qf");
    expect(segment.fareClass).toBe("y");
    expect(segment.fromAirport).toBe(mockAirport1);
    expect(segment.toAirport).toBe(mockAirport2);
  });

  it("creates a segment using options object", () => {
    const segment: Segment = createSegment({
      airline: "va",
      fareClass: "j",
      fromAirport: mockAirport1,
      toAirport: mockAirport2,
    });
    expect(segment.airline).toBe("va");
    expect(segment.fareClass).toBe("j");
    expect(segment.fromAirport).toBe(mockAirport1);
    expect(segment.toAirport).toBe(mockAirport2);
  });

  it("converts segment to string using segmentToString", () => {
    const segment = createSegment("qf", "y", mockAirport1, mockAirport2);
    expect(segmentToString(segment)).toBe("qf y SYD MEL");
  });

  it("supports updates via object spread", () => {
    const segment = createSegment("qf", "y", mockAirport1, mockAirport2);
    const updated: Segment = { ...segment, fareClass: "j" };
    expect(updated.fareClass).toBe("j");
    expect(updated.airline).toBe("qf");
  });
});
