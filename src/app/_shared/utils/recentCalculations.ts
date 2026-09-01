import { SegmentInput } from "@/app/_shared/models/segmentInput";

export interface SavedCalculation {
  segmentInputs: SegmentInput[];
  tripType: string;
  eliteStatus: string;
}

interface RawSavedCalculation {
  segmentInputs: Array<{
    airline: string;
    fareClass: string;
    fromAirportText: string;
    toAirportText: string;
    uuid?: string;
  }>;
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
    segmentInputs: segmentInputs.map(
      (segmentInput) =>
        new SegmentInput(
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
  const savedCalculations: RawSavedCalculation[] = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );
  return savedCalculations.map((savedCalculation) => {
    return {
      segmentInputs: savedCalculation.segmentInputs.map((segmentInput) => {
        return new SegmentInput(
          segmentInput.airline,
          segmentInput.fareClass,
          segmentInput.fromAirportText,
          segmentInput.toAirportText
        );
      }),
      tripType: savedCalculation.tripType,
      eliteStatus: savedCalculation.eliteStatus,
    };
  });
};

export const setSavedCalculations = (
  savedCalculations: SavedCalculation[],
  storageKey: string = "saved-calculations"
): void => {
  if (typeof window === "undefined") {
    return;
  }
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
};

export const deleteAllSavedCalculations = (
  storageKey: string = "saved-calculations"
): SavedCalculation[] => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(storageKey);
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
