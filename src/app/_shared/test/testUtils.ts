import { Segment } from '@/app/_shared/models/segment';
import { getAirport } from '@/app/_shared/utils/airports';
import type { Airport } from '@/types/airport';

export const buildSegment = (
  airline: string,
  fareClass: string,
  fromAirportIata: string,
  toAirportIata: string,
): Segment => {
  return new Segment(
    airline,
    fareClass,
    getAirport(fromAirportIata) as Airport,
    getAirport(toAirportIata) as Airport,
  );
};

export const buildSegmentFromString = (segmentString: string): Segment => {
  const [airline, fareClass, fromAirportIata, toAirportIata] = segmentString.split(' ');
  return buildSegment(airline, fareClass, fromAirportIata, toAirportIata);
};
