import { SegmentInput } from '@/shared/models/segmentInput';

export const saveCalculation = (segmentInputs, theTripType, theEliteStatus) => {
  const calculationToSave = {
    segmentInputs: segmentInputs.map(
      (segmentInput) =>
        new SegmentInput(
          segmentInput.airline,
          segmentInput.fareClass,
          segmentInput.fromAirportText,
          segmentInput.toAirportText,
          segmentInput.uuid,
        ),
    ),
    tripType: theTripType,
    eliteStatus: theEliteStatus,
  };

  // get the current saved calculations and remove and matching calc's so we don't create duplicates
  // max number of saved calculations will be 10
  const savedCalculations = getSavedCalculations()
    .filter((savedCalculation) => {
      return !isEqualSavedCalculations(savedCalculation, calculationToSave);
    })
    .slice(0, 9);

  // prepend the new saved calculation
  savedCalculations.unshift(calculationToSave);

  setSavedCalculations(savedCalculations);

  return savedCalculations;
};

export const getSavedCalculations = () => {
  const savedCalculations = JSON.parse(localStorage.getItem('saved-calculations') || '[]');
  return savedCalculations.map((savedCalculation) => {
    return {
      segmentInputs: savedCalculation.segmentInputs.map((segmentInput) => {
        return new SegmentInput(
          segmentInput.airline,
          segmentInput.fareClass,
          segmentInput.fromAirportText,
          segmentInput.toAirportText,
        );
      }),
      tripType: savedCalculation.tripType,
      eliteStatus: savedCalculation.eliteStatus,
    };
  });
};

export const setSavedCalculations = (savedCalculations) => {
  localStorage.setItem(
    'saved-calculations',
    JSON.stringify(
      savedCalculations.map((savedCalculation) => {
        return {
          segmentInputs: savedCalculation.segmentInputs.map((segmentInput) => {
            const theSegmentInput = new SegmentInput(
              segmentInput.airline,
              segmentInput.fareClass,
              segmentInput.fromAirportText,
              segmentInput.toAirportText,
            );
            theSegmentInput.uuid = undefined;
            return theSegmentInput;
          }),
          tripType: savedCalculation.tripType,
          eliteStatus: savedCalculation.eliteStatus,
        };
      }),
    ),
  );
};

export const deleteAllSavedCalculations = () => {
  localStorage.removeItem('saved-calculations');
  return [];
};

export const deleteSavedCalculationAtIdx = (idx) => {
  const savedCalculations = getSavedCalculations();

  // TODO better error handling?
  if (idx < 0 || idx > savedCalculations.length - 1) {
    return savedCalculations;
  }

  savedCalculations.splice(idx, 1);

  setSavedCalculations(savedCalculations);
  return savedCalculations;
};

const isEqualSavedCalculations = (calc1, calc2) => {
  if (calc1.eliteStatus !== calc2.eliteStatus || calc1.tripType !== calc2.tripType) {
    return false;
  }

  if (calc1.segmentInputs.length !== calc2.segmentInputs.length) {
    return false;
  }

  const getSegmentInputDataToCompare = (segmentInputs) => {
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
