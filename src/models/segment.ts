import type { Airport } from "@/types/airport";

export interface Segment {
  readonly airline: string;
  readonly fareClass: string;
  readonly fromAirport: Airport;
  readonly toAirport: Airport;
}

export interface CreateSegmentOptions {
  airline: string;
  fareClass: string;
  fromAirport: Airport;
  toAirport: Airport;
}

export function createSegment(options: CreateSegmentOptions): Segment;
export function createSegment(
  airline: string,
  fareClass: string,
  fromAirport: Airport,
  toAirport: Airport
): Segment;
export function createSegment(
  airlineOrOptions: string | CreateSegmentOptions,
  fareClass?: string,
  fromAirport?: Airport,
  toAirport?: Airport
): Segment {
  if (typeof airlineOrOptions === "object" && airlineOrOptions !== null) {
    return {
      airline: airlineOrOptions.airline,
      fareClass: airlineOrOptions.fareClass,
      fromAirport: airlineOrOptions.fromAirport,
      toAirport: airlineOrOptions.toAirport,
    };
  }
  return {
    airline: airlineOrOptions,
    fareClass: fareClass!,
    fromAirport: fromAirport!,
    toAirport: toAirport!,
  };
}

export const segmentToString = (segment: Segment): string => {
  return `${segment.airline} ${segment.fareClass} ${segment.fromAirport?.iata || ""} ${segment.toAirport?.iata || ""}`;
};
