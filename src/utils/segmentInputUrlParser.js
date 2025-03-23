import { SegmentInput } from '@/models/segmentInput';

export const createUrlQueryParams = (eliteStatus, segmentInputs, tripType) => {
  return {
    eliteStatus,
    tripType,
    segmentInputs: encodeSegmentInputs(segmentInputs),
  };
};

export const parseUrlQueryParams = (searchParams) => {
  const eliteStatus = searchParams.get('eliteStatus');
  const tripType = searchParams.get('tripType');
  const segmentInputs = decodeSegmentInputs(searchParams.get('segmentInputs'));

  return {
    eliteStatus,
    tripType,
    segmentInputs,
  };
};

const encodeSegmentInputs = (segmentInputs) => {
  const encodedSegments = [];
  for (const segmentInput of segmentInputs) {
    encodedSegments.push(
      [
        segmentInput.airline,
        segmentInput.fromAirportText,
        segmentInput.toAirportText,
        segmentInput.fareClass,
      ].join('_'),
    );
  }

  return encodedSegments.join('-');
};

const decodeSegmentInputs = (segmentInputsString) => {
  if (!segmentInputsString) {
    return undefined;
  }

  const segmentInputs = [];
  for (const segmentString of segmentInputsString.split('-')) {
    const segmentParts = segmentString.split('_');
    segmentInputs.push(
      new SegmentInput(segmentParts[0], segmentParts[3], segmentParts[1], segmentParts[2]),
    );
  }
  return segmentInputs;
};
