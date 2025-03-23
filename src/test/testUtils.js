import { Segment } from '@/models/segment';
import { getAirport } from '@/utils/airports';

export const buildSegment = (airline, fareClass, fromAirportIata, toAirportIata) => {
  return new Segment(airline, fareClass, getAirport(fromAirportIata), getAirport(toAirportIata));
};

export const buildSegmentFromString = (segmentString) => {
  return buildSegment(...segmentString.split(' '));
};
