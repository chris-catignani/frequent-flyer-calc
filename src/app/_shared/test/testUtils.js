import { Segment } from '@/app/_shared/models/segment';
import { getAirport } from '@/app/_shared/utils/airports';

export const buildSegment = (airline, fareClass, fromAirportIata, toAirportIata) => {
  return new Segment(airline, fareClass, getAirport(fromAirportIata), getAirport(toAirportIata));
};

export const buildSegmentFromString = (segmentString) => {
  return buildSegment(...segmentString.split(' '));
};
