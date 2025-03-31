import { SegmentInput } from '@/models/segmentInput';

export const saveCalculation = (segmentInputs, theTripType, theEliteStatus) => {
  const calculationToSave = {
    segmentInputs: segmentInputs.map(
      (segmentInput) =>
        new SegmentInput(
          segmentInput.airline,
          segmentInput.fareClass,
          segmentInput.fromAirportText,
          segmentInput.toAirportText,
        ),
    ),
    tripType: theTripType,
    eliteStatus: theEliteStatus,
  };

  // get the current saved calculations and remove and matching calc's so we don't create duplicates
  // max number of saved calculations will be 10
  const savedCalculations = getSavedCalculations()
    .filter((savedCalculation) => {
      return JSON.stringify(savedCalculation) !== JSON.stringify(calculationToSave);
    })
    .slice(0, 9);

  // prepend the new saved calculation
  savedCalculations.unshift(calculationToSave);

  localStorage.setItem('saved-calculations', JSON.stringify(savedCalculations));

  return savedCalculations;
};

export const getSavedCalculations = () => {
  const savedCalculationsJson = localStorage.getItem('saved-calculations') || '[]';
  return JSON.parse(savedCalculationsJson);
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

  localStorage.setItem('saved-calculations', JSON.stringify(savedCalculations));
  return savedCalculations;
};
