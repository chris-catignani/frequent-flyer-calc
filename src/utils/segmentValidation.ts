import type { SegmentInput } from "@/models/segmentInput";
import type { ProgramOptions } from "@/types/program";
import type { SegmentErrors, SegmentInputAdapter } from "@/types/segmentInput";

export const validate = (
  segmentInputs: SegmentInput[],
  adapter?: SegmentInputAdapter,
  programOptions: ProgramOptions = {}
): SegmentErrors => {
  const errors: SegmentErrors = {};

  const addError = (segmentInputIdx: number, fieldName: string, error: string) => {
    if (!errors[segmentInputIdx]) {
      errors[segmentInputIdx] = {};
    }
    errors[segmentInputIdx][fieldName] = error;
  };

  segmentInputs.forEach((segmentInput, idx) => {
    if (!segmentInput.airline) {
      addError(idx, "airline", "Required");
    }
    if (!segmentInput.fromAirportText) {
      addError(idx, "fromAirportText", "Required");
    }
    if (!segmentInput.toAirportText) {
      addError(idx, "toAirportText", "Required");
    }
    const fareClassRequired = adapter?.isFareClassRequired?.(segmentInput, programOptions) ?? true;
    if (fareClassRequired && !segmentInput.fareClass) {
      addError(idx, "fareClass", "Required");
    }

    if (segmentInput.fromAirportText && !segmentInput.fromAirport) {
      addError(idx, "fromAirportText", "Invalid IATA");
    }
    if (segmentInput.toAirportText && !segmentInput.toAirport) {
      addError(idx, "toAirportText", "Invalid IATA");
    }

    if (adapter?.validateSegment) {
      const customErrors = adapter.validateSegment(segmentInput, idx, programOptions);
      if (customErrors) {
        Object.entries(customErrors).forEach(([fieldName, err]) => {
          addError(idx, fieldName, err);
        });
      }
    }
  });

  return errors;
};
