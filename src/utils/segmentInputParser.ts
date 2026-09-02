import { JETSTAR_AIRLINES, JETSTAR_LETTER_FARE_CLASSES } from "@/calculators/qantas/constants";
import { SegmentInput } from "@/models/segmentInput";

export interface ParseResult {
  segmentInputs: SegmentInput[];
  parsingError?: string;
}

export const parseEncodedTextItin = (
  textItin: string,
  segmentSeparator: string,
  segmentItemSeparator: string
): ParseResult => {
  const segmentInputs: SegmentInput[] = [];

  if (!textItin || textItin === "") {
    const parsingError = "Text itinerary is required";
    return { segmentInputs, parsingError };
  }

  for (const itin of textItin.split(segmentSeparator)) {
    const formattedItin = itin.trim();
    const parts = formattedItin.split(segmentItemSeparator);

    if (parts.length !== 4) {
      const parsingError = `"${formattedItin}" is not formatted correctly`;
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

interface ItaBookingInfo {
  bookingCode: string;
}

interface ItaLeg {
  origin: { code: string };
  destination: { code: string };
}

interface ItaSegment {
  carrier: { code: string };
  bookingInfos: ItaBookingInfo[];
  legs: ItaLeg[];
}

interface ItaSlice {
  segments: ItaSegment[];
}

interface ItaMatrixObject {
  itinerary?: {
    slices?: ItaSlice[];
  };
}

export const parseItaMatrixInput = (itaMatrixJson: string): ParseResult => {
  const segmentInputs: SegmentInput[] = [];

  if (!itaMatrixJson || itaMatrixJson === "") {
    const parsingError = "ITA Matrix JSON required";
    return { segmentInputs, parsingError };
  }

  let itaMatrixObj: ItaMatrixObject | undefined = undefined;

  try {
    itaMatrixObj = JSON.parse(itaMatrixJson);
  } catch (err) {
    console.log(err);
    const parsingError = "Invalid JSON format";
    return { segmentInputs, parsingError };
  }

  if (!itaMatrixObj?.itinerary?.slices) {
    const parsingError = "ITA Matrix JSON missing itinerary, or slices";
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

  return { segmentInputs, parsingError: undefined };
};

const parseFareClass = (airline: string, fareClass: string): string => {
  if (JETSTAR_AIRLINES.has(airline)) {
    return JETSTAR_LETTER_FARE_CLASSES[fareClass] || fareClass;
  }

  return fareClass;
};
