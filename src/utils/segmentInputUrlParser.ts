import { createSegmentInput, type SegmentInput } from "@/models/segmentInput";
import type { ProgramOptions } from "@/types/program";

export interface ParsedUrlParams {
  eliteStatus: string | null;
  tripType: string | null;
  segmentInputs?: SegmentInput[];
  programOptions?: ProgramOptions;
}

type SearchParamsLike = { get: (key: string) => string | null };

export const createUrlQueryParams = (
  eliteStatus: string,
  segmentInputs: SegmentInput[],
  tripType: string,
  programOptions: ProgramOptions = {}
): Record<string, string> => {
  const params: Record<string, string> = {
    eliteStatus,
    tripType,
    segmentInputs: encodeSegmentInputs(segmentInputs),
  };
  Object.entries(programOptions).forEach(([key, value]) => {
    params[key] = String(value);
  });
  return params;
};

export const parseUrlQueryParams = (
  searchParams?: SearchParamsLike | null,
  defaultOptions?: ProgramOptions
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
  const programOptions = decodeProgramOptions(searchParams, defaultOptions);

  return {
    eliteStatus,
    tripType,
    segmentInputs,
    ...(programOptions ? { programOptions } : {}),
  };
};

// Only keys the program declares are read, and each value is coerced to its default's type
const decodeProgramOptions = (
  searchParams: SearchParamsLike,
  defaultOptions?: ProgramOptions
): ProgramOptions | undefined => {
  if (!defaultOptions) {
    return undefined;
  }

  const decoded: ProgramOptions = {};
  for (const [key, defaultValue] of Object.entries(defaultOptions)) {
    const raw = searchParams.get(key);
    if (raw === null) {
      continue;
    }
    if (typeof defaultValue === "number") {
      const parsed = Number(raw);
      if (raw.trim() !== "" && Number.isFinite(parsed)) {
        decoded[key] = parsed;
      }
    } else if (typeof defaultValue === "boolean") {
      if (raw === "true" || raw === "false") {
        decoded[key] = raw === "true";
      }
    } else {
      decoded[key] = raw;
    }
  }

  return Object.keys(decoded).length > 0 ? decoded : undefined;
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
      createSegmentInput(segmentParts[0], segmentParts[3], segmentParts[1], segmentParts[2])
    );
  }
  return segmentInputs;
};
