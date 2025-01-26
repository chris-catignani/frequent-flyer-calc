"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Button, Container, Grid2, IconButton, Stack } from '@mui/material';
import { RouteInput } from '@/components/input';
import AddIcon from '@mui/icons-material/Add';
import { Remove } from '@mui/icons-material';
import { Results } from '@/components/results';

export default function Home() {

  const [segments, setSegments] = useState([new Segment('', '', '', '')])
  const [calculationOutput, setCalculationOutput] = useState();

  const calculatePressed = () => {
    setCalculationOutput(calculate(segments))
  }

  const addSegmentPressed = () => {
    setSegments([
      ...segments,
      new Segment('', '', '', '')
    ])
  }

  const removeSegmentPressed = (segmentIdx) => {
    const newSegments = [...segments]
    newSegments.splice(segmentIdx, 1);
    setSegments(newSegments)
  }

  return (
    <Container>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        {segments.map((segment, segmentIdx) => {
          const iconToAdd =
            segmentIdx === segments.length - 1 ? (
              <IconButton onClick={addSegmentPressed}>
                <AddIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => removeSegmentPressed(segmentIdx)}>
                <Remove />
              </IconButton>
            );
          return (
            <Grid2 container key={segmentIdx}>
              <RouteInput
                segment={segment}
                onChange={(segment) => {
                  const newSegments = [...segments];
                  newSegments[segmentIdx] = segment;
                  setSegments(newSegments);

                  // if input changes, ensure calculated data is voided
                  setCalculationOutput(null);
                }}
              />
              {iconToAdd}
            </Grid2>
          );
        })}
      </Stack>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        mt={2}
      >
        <Button variant="contained" onClick={calculatePressed}>
          Calculate
        </Button>
      </Grid2>
      <Results calculatedData={calculationOutput} />
    </Container>
  );
}
