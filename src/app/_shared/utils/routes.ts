import { calcDistance } from "@/app/_shared/utils/airports";
import type { SegmentInput } from "@/app/_shared/models/segmentInput";
import type { Segment } from "@/app/_shared/models/segment";

/**
 * create an array of continuous route segments, not duplicating start and end airports
 * e.g. "jfk-dfw-phx, psp-lax"
 */
export const buildRouteDisplayString = (segmentInputs: SegmentInput[]): string => {
  // create chains of segments, e.g. [ [jfk-dfw-phx], [psp-lax] ]
  const airportSegmentChains = segmentInputs.reduce<string[][]>((chains, segmentInput) => {
    if (chains.length === 0) {
      chains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
    } else {
      const curSegmentChain = chains.pop()!;
      if (curSegmentChain[curSegmentChain.length - 1] === segmentInput.fromAirportText) {
        curSegmentChain.push(segmentInput.toAirportText);
        chains.push(curSegmentChain);
      } else {
        chains.push(curSegmentChain);
        chains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
      }
    }
    return chains;
  }, []);

  const airportSegmentChainsString = airportSegmentChains.map((airportSegmentChain) => {
    return airportSegmentChain.join("-");
  });

  return airportSegmentChainsString.join(", ");
};

export const calculateTotalDistance = (segments: Segment[]): number => {
  let distance = 0;

  segments.forEach((segment) => {
    distance += calcDistance(segment.fromAirport, segment.toAirport);
  });

  return distance;
};

export const calulateTotalDistance = calculateTotalDistance;
