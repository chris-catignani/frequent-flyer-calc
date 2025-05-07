'use client';

import { ProgramComparison } from '@/components/display/programComparison';
import { SegmentInput } from '@/models/segmentInput';
import { parseEncodedTextItin } from '@/utils/segmentInputParser';
import { Button, Grid2, TextField } from '@mui/material';
import { useState } from 'react';

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
  const [programs, setPrograms] = useState(['qantas']);

  const onAddRoute = (route) => {
    setRoutes([...routes, route]);
  };

  return (
    <>
      <ProgramComparison routes={routes} programs={programs} results={[]} />
      <AddRoute onAddRoute={onAddRoute} />
    </>
  );
}
