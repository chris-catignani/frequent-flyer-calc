import { AdvancedInput } from '@/app/_shared/components/advancedInput';
import { buildAirlineOptions, SegmentInputList } from '@/app/_shared/components/segmentInput';
import { SegmentInput } from '@/app/_shared/models/segmentInput';
import { getAirport } from '@/app/_shared/utils/airports';
import { Button, Grid2 } from '@mui/material';
import { SUPPORTED_AIRLINES } from '../_models/constants';

export const RouteInput = ({ route, onRouteUpdate }) => {
  if (!route) {
    return <></>;
  }

  const setAndHydrateSegmentInputs = (theSegmentInputs) => {
    theSegmentInputs.forEach((segmentInput) => {
      segmentInput.fromAirport = getAirport(segmentInput.fromAirportText);
      segmentInput.toAirport = getAirport(segmentInput.toAirportText);
    });
    onRouteUpdate(route.clone({ segmentInputs: theSegmentInputs }));
  };

  const addSegmentPressed = () => {
    const previousSegment = route.segmentInputs[route.segmentInputs.length - 1];
    setAndHydrateSegmentInputs([
      ...route.segmentInputs,
      new SegmentInput(previousSegment.airline, '', previousSegment.toAirportText, ''),
    ]);
  };

  const deleteSegmentPressed = (segmentInputIdx) => {
    const newSegmentInputs = [...route.segmentInputs];
    newSegmentInputs.splice(segmentInputIdx, 1);
    setAndHydrateSegmentInputs(newSegmentInputs);
  };

  const segmentInputChanged = (segmentInputIdx, segmentInput) => {
    const newSegmentInputs = [...route.segmentInputs];
    newSegmentInputs[segmentInputIdx] = segmentInput;
    setAndHydrateSegmentInputs(newSegmentInputs);
  };

  const segmentsReordered = (originIdx, targetIdx) => {
    const newSegmentInputs = [...route.segmentInputs];
    const itemToMove = newSegmentInputs[originIdx];
    newSegmentInputs.splice(originIdx, 1);
    newSegmentInputs.splice(targetIdx, 0, itemToMove);
    setAndHydrateSegmentInputs(newSegmentInputs);
  };

  return (
    <Grid2 container spacing={1}>
      <SegmentInputList
        segmentInputs={route.segmentInputs}
        errors={[]} // TODO errors
        airlineOptions={[...buildAirlineOptions(SUPPORTED_AIRLINES)]}
        onDeleteSegmentPressed={deleteSegmentPressed}
        onSegmentInputChanged={segmentInputChanged}
        onSegmentsReordered={segmentsReordered}
      />
      <Button variant="contained" onClick={addSegmentPressed}>
        Add Segment
      </Button>
      <AdvancedInput setSegmentInputs={setAndHydrateSegmentInputs}></AdvancedInput>
    </Grid2>
  );
};
