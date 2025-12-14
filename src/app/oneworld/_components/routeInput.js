import { AdvancedInput } from '@/app/_shared/components/advancedInput';
import { buildAirlineOptions, SegmentInputList } from '@/app/_shared/components/segmentInput';
import { SegmentInput } from '@/app/_shared/models/segmentInput';
import { getAirport } from '@/app/_shared/utils/airports';
import { Button, Grid, TextField } from '@mui/material';
import {
  NON_ALLIANCE_AIRLINES,
  ONEWORLD_AIRLINES,
  SKYTEAM_AIRLINES,
  STAR_ALLIANCE_AIRLINES,
} from '@/app/_shared/models/constants';

const CostField = ({ cost, errors, onCostChange }) => {
  return (
    <TextField
      label={'Subtotal (including surcharges)'}
      type="number"
      value={cost || ''}
      error={errors && errors['subtotal']}
      helperText={errors ? errors['subtotal'] : ' '}
      sx={{ width: '100%' }}
      onChange={(event) => {
        onCostChange(event.target.value);
      }}
    />
  );
};

export const RouteInput = ({ route, errors, onRouteUpdate }) => {
  if (!route) {
    return <></>;
  }

  console.log(route);

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

  const costChanged = (subtotal) => {
    onRouteUpdate(route.clone({ subtotal }));
  };

  return (
    <Grid container spacing={1}>
      <SegmentInputList
        segmentInputs={route.segmentInputs}
        errors={errors}
        airlineOptions={[
          ...buildAirlineOptions(Object.keys(ONEWORLD_AIRLINES), 'oneworld Airlines'),
          ...buildAirlineOptions(Object.keys(SKYTEAM_AIRLINES), 'SkyTeam Airlines'),
          ...buildAirlineOptions(Object.keys(STAR_ALLIANCE_AIRLINES), 'Star Alliance Airlines'),
          ...buildAirlineOptions(Object.keys(NON_ALLIANCE_AIRLINES), 'Other Airlines'),
        ]}
        onDeleteSegmentPressed={deleteSegmentPressed}
        onSegmentInputChanged={segmentInputChanged}
        onSegmentsReordered={segmentsReordered}
      />
      <Button variant="contained" onClick={addSegmentPressed}>
        Add Segment
      </Button>
      <CostField cost={route.subtotal} onCostChange={costChanged} />
      <AdvancedInput setSegmentInputs={setAndHydrateSegmentInputs}></AdvancedInput>
    </Grid>
  );
};
