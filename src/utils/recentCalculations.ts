import { createSegmentInput, type SegmentInput } from "@/models/segmentInput";

export interface SavedCalculation {
  segmentInputs: SegmentInput[];
  tripType: string;
  eliteStatus: string;
}

export const saveCalculation = (
  segmentInputs: SegmentInput[],
  theTripType: string,
  theEliteStatus: string,
  storageKey: string = "saved-calculations"
): SavedCalculation[] => {
  const calculationToSave: SavedCalculation = {
    segmentInputs: segmentInputs.map((segmentInput) =>
      createSegmentInput(
        segmentInput.airline,
        segmentInput.fareClass,
        segmentInput.fromAirportText,
        segmentInput.toAirportText,
        segmentInput.uuid
      )
    ),
    tripType: theTripType,
    eliteStatus: theEliteStatus,
  };

  // get the current saved calculations and remove and matching calc's so we don't create duplicates
  // max number of saved calculations will be 10
  const savedCalculations = getSavedCalculations(storageKey)
    .filter((savedCalculation) => {
      return !isEqualSavedCalculations(savedCalculation, calculationToSave);
    })
    .slice(0, 9);

  // prepend the new saved calculation
  savedCalculations.unshift(calculationToSave);

  setSavedCalculations(savedCalculations, storageKey);

  return savedCalculations;
};

export const getSavedCalculations = (
  storageKey: string = "saved-calculations"
): SavedCalculation[] => {
  if (typeof window === "undefined") {
    return [];
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    return [];
  }

  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
    return [];
  }

  if (!Array.isArray(parsed)) {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
    return [];
  }

  const validCalculations: SavedCalculation[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object" || !Array.isArray(item.segmentInputs)) {
      continue;
    }

    const segmentInputs: SegmentInput[] = [];
    for (const segmentInput of item.segmentInputs) {
      if (segmentInput && typeof segmentInput === "object") {
        segmentInputs.push(
          createSegmentInput(
            typeof segmentInput.airline === "string" ? segmentInput.airline : "",
            typeof segmentInput.fareClass === "string" ? segmentInput.fareClass : "",
            typeof segmentInput.fromAirportText === "string" ? segmentInput.fromAirportText : "",
            typeof segmentInput.toAirportText === "string" ? segmentInput.toAirportText : "",
            typeof segmentInput.uuid === "string" ? segmentInput.uuid : undefined
          )
        );
      }
    }

    if (segmentInputs.length === 0) {
      continue;
    }

    validCalculations.push({
      segmentInputs,
      tripType: typeof item.tripType === "string" ? item.tripType : "",
      eliteStatus: typeof item.eliteStatus === "string" ? item.eliteStatus : "",
    });
  }

  return validCalculations;
};

export const setSavedCalculations = (
  savedCalculations: SavedCalculation[],
  storageKey: string = "saved-calculations"
): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(
        savedCalculations.map((savedCalculation) => {
          return {
            segmentInputs: savedCalculation.segmentInputs.map((segmentInput) => {
              return {
                airline: segmentInput.airline,
                fareClass: segmentInput.fareClass,
                fromAirportText: segmentInput.fromAirportText,
                toAirportText: segmentInput.toAirportText,
              };
            }),
            tripType: savedCalculation.tripType,
            eliteStatus: savedCalculation.eliteStatus,
          };
        })
      )
    );
  } catch {
    // Handle QuotaExceededError or private browsing SecurityError gracefully
  }
};

export const deleteAllSavedCalculations = (
  storageKey: string = "saved-calculations"
): SavedCalculation[] => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }
  return [];
};

export const deleteSavedCalculationAtIdx = (
  idx: number,
  storageKey: string = "saved-calculations"
): SavedCalculation[] => {
  const savedCalculations = getSavedCalculations(storageKey);

  if (idx < 0 || idx > savedCalculations.length - 1) {
    return savedCalculations;
  }

  savedCalculations.splice(idx, 1);

  setSavedCalculations(savedCalculations, storageKey);
  return savedCalculations;
};

const isEqualSavedCalculations = (calc1: SavedCalculation, calc2: SavedCalculation): boolean => {
  if (calc1.eliteStatus !== calc2.eliteStatus || calc1.tripType !== calc2.tripType) {
    return false;
  }

  if (calc1.segmentInputs.length !== calc2.segmentInputs.length) {
    return false;
  }

  const getSegmentInputDataToCompare = (segmentInputs: SegmentInput[]) => {
    return segmentInputs.map((segmentInput) => {
      return {
        airline: segmentInput.airline,
        fromAirportText: segmentInput.fromAirportText,
        toAirportText: segmentInput.toAirportText,
        fareClass: segmentInput.fareClass,
      };
    });
  };

  return (
    JSON.stringify(getSegmentInputDataToCompare(calc1.segmentInputs)) ===
    JSON.stringify(getSegmentInputDataToCompare(calc2.segmentInputs))
  );
};
