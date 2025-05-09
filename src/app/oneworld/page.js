'use client';

import { SegmentInput } from '@/app/_shared/models/segmentInput';
import { parseEncodedTextItin } from '@/app/_shared/utils/segmentInputParser';
import { Button, Grid2, TextField } from '@mui/material';
import { useState } from 'react';
import { ProgramComparison } from './_components/programComparison';

const AddRoute = ({ onAddRoute }) => {
  const [route, setRoute] = useState('');

  const addRoute = () => {
    const { segmentInputs, parsingError } = parseEncodedTextItin(route, ',', ' ');
    console.log(segmentInputs, parsingError);
    onAddRoute(segmentInputs);
    setRoute('');
  };

  return (
    <Grid2 container>
      <TextField value={route} onChange={(event) => setRoute(event.target.value)} />
      <Button onClick={addRoute}>Add Route</Button>
    </Grid2>
  );
};

export default function Oneworld() {
  const [routes, setRoutes] = useState([[new SegmentInput('aa', 'i', 'jfk', 'sfo')]]);

  const onAddRoute = (route) => {
    setRoutes([...routes, route]);
  };

  return (
    <>
      <ProgramComparison routes={routes} programs={['qantas']} results={[]} />
      <AddRoute onAddRoute={onAddRoute} />
    </>
  );
}
