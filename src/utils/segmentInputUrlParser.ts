import { SegmentInput } from "@/models/segmentInput";

export interface ParsedUrlParams {
  eliteStatus: string | null;
  tripType: string | null;
  segmentInputs?: SegmentInput[];
}

export const createUrlQueryParams = (
  eliteStatus: string,
  segmentInputs: SegmentInput[],
  tripType: string
): { eliteStatus: string; tripType: string; segmentInputs: string } => {
  return {
    eliteStatus,
    tripType,
    segmentInputs: encodeSegmentInputs(segmentInputs),
  };
};

export const parseUrlQueryParams = (
  searchParams?: { get: (key: string) => string | null } | null
): ParsedUrlParams => {
  if (!searchParams) {
    return {
      eliteStatus: null,
      tripType: null,
      segmentInputs: undefined,
    };
  }

  const eliteStatus = searchParams.get("eliteStatus");
  const tripType = searchParams.get("tripType");
  const segmentInputs = decodeSegmentInputs(searchParams.get("segmentInputs"));

  return {
    eliteStatus,
    tripType,
    segmentInputs,
  };
};

const encodeSegmentInputs = (segmentInputs: SegmentInput[]): string => {
  const encodedSegments: string[] = [];
  for (const segmentInput of segmentInputs) {
    encodedSegments.push(
      [
        segmentInput.airline,
        segmentInput.fromAirportText,
        segmentInput.toAirportText,
        segmentInput.fareClass,
      ].join("_")
    );
  }

  return encodedSegments.join("-");
};

const decodeSegmentInputs = (segmentInputsString: string | null): SegmentInput[] | undefined => {
  if (!segmentInputsString) {
    return undefined;
  }

  const segmentInputs: SegmentInput[] = [];
  for (const segmentString of segmentInputsString.split("-")) {
    const segmentParts = segmentString.split("_");
    segmentInputs.push(
      new SegmentInput(segmentParts[0], segmentParts[3], segmentParts[1], segmentParts[2])
    );
  }
  return segmentInputs;
};
