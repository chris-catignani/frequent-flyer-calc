import { JETSTAR_AIRLINES, JETSTAR_LETTER_FARE_CLASSES } from '@/models/constants';
import { SegmentInput } from '@/models/segmentInput';

export const parseEncodedTextItin = (textItin, segmentSeparator, segmentItemSeparator) => {
  const segmentInputs = [];

  if (!textItin || textItin === '') {
    const parsingError = 'Text itinerary is required';
    return { segmentInputs, parsingError };
  }

  for (const itin of textItin.split(segmentSeparator)) {
    const parts = itin.split(segmentItemSeparator);

    if (parts.length !== 4) {
      const parsingError = `"${itin}" is not formatted correctly`;
      return { segmentInputs: [], parsingError };
    }

    const airline = parts[0].toLowerCase();
    const fromAirportText = parts[1].toLowerCase();
    const toAirportText = parts[2].toLowerCase();
    const fareClass = parseFareClass(airline, parts[3].toLowerCase());

    segmentInputs.push(new SegmentInput(airline, fareClass, fromAirportText, toAirportText));
  }

  return { segmentInputs, parsingError: undefined };
};

export const parseItaMatrixInput = (itaMatrixJson) => {
  const segmentInputs = [];

  if (!itaMatrixJson || itaMatrixJson === '') {
    const parsingError = 'ITA Matrix JSON required';
    return { segmentInputs, parsingError };
  }

  let itaMatrixObj = undefined;

  try {
    itaMatrixObj = JSON.parse(itaMatrixJson);
  } catch (err) {
    console.log(err);
    const parsingError = 'Invalid JSON format';
    return { segmentInputs, parsingError };
  }

  if (!itaMatrixObj.itinerary?.slices) {
    const parsingError = 'ITA Matrix JSON missing itinerary, or slices';
    return { segmentInputs, parsingError };
  }

  itaMatrixObj.itinerary.slices.forEach((slice) => {
    slice.segments.forEach((segment) => {
      const airline = segment.carrier.code.toLowerCase();
      const fareClass = parseFareClass(airline, segment.bookingInfos[0].bookingCode.toLowerCase());

      segment.legs.forEach((leg) => {
        const fromAirportText = leg.origin.code.toLowerCase();
        const toAirportText = leg.destination.code.toLowerCase();

        segmentInputs.push(new SegmentInput(airline, fareClass, fromAirportText, toAirportText));
      });
    });
  });

  console.log(segmentInputs);

  return { segmentInputs, parsingError: undefined };
};

const parseFareClass = (airline, fareClass) => {
  if (JETSTAR_AIRLINES.has(airline)) {
    return JETSTAR_LETTER_FARE_CLASSES[fareClass] || fareClass;
  }

  return fareClass;
};
