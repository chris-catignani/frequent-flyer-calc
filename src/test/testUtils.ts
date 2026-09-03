import { createSegment, type Segment } from "@/models/segment";
import { getAirport } from "@/utils/airports";
import type { Airport } from "@/types/airport";

export const buildSegment = (
  airline: string,
  fareClass: string,
  fromAirportIata: string,
  toAirportIata: string
): Segment => {
  return createSegment(
    airline,
    fareClass,
    getAirport(fromAirportIata) as Airport,
    getAirport(toAirportIata) as Airport
  );
};

export const buildSegmentFromString = (segmentString: string): Segment => {
  const [airline, fareClass, fromAirportIata, toAirportIata] = segmentString.split(" ");
  return buildSegment(airline, fareClass, fromAirportIata, toAirportIata);
};
