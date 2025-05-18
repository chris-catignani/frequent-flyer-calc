import { calcDistance } from './airports';

/**
 * create an array of continuous route segments, not duplicating start and end airports
 * e.g. "jfk-dfw-phx, psp-lax"
 */
export const buildRouteDisplayString = (segmentInputs) => {
  // create chains of segments, e.g. [ [jfk-dfw-phx], [psp-lax] ]
  const airportSegmentChains = segmentInputs.reduce((airportSegmentChains, segmentInput) => {
    if (airportSegmentChains.length === 0) {
      airportSegmentChains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
    } else {
      const curSegmentChain = airportSegmentChains.pop();
      if (curSegmentChain[curSegmentChain.length - 1] === segmentInput.fromAirportText) {
        curSegmentChain.push(segmentInput.toAirportText);
        airportSegmentChains.push(curSegmentChain);
      } else {
        airportSegmentChains.push(curSegmentChain);
        airportSegmentChains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
      }
    }
    return airportSegmentChains;
  }, []);

  const airportSegmentChainsString = airportSegmentChains.map((airportSegmentChain) => {
    return airportSegmentChain.join('-');
  });

  return airportSegmentChainsString.join(', ');
};

export const calulateTotalDistance = (segments) => {
  let distance = 0;

  segments.forEach((segment) => {
    distance += calcDistance(segment.fromAirport, segment.toAirport);
  });

  return distance;
};
