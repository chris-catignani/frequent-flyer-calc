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

  const [inputErrors, setInputErrors] = useState(false)
  const [segments, setSegments] = useState([new Segment('', '', '', '')])
  const [calculationOutput, setCalculationOutput] = useState();

  const validateInput = () => {
    for (let segment of segments) {
      if(!segment.airline || !segment.fromAirport || !segment.toAirport || !segment.fareClass) {
        return false
      }
    }
    return true
  }

  const calculatePressed = () => {
    if (!validateInput()) {
      setInputErrors(true)
    } else {
      setInputErrors(false)
      setCalculationOutput(calculate(segments));
    }
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
        spacing={1}
      >
        {segments.map((segment, segmentIdx) => {
          const iconToAdd =
            segmentIdx === segments.length - 1 ? (
              <IconButton sx={{mb: 2}} onClick={addSegmentPressed}>
                <AddIcon />
              </IconButton>
            ) : (
              <IconButton sx={{mb: 2}} onClick={() => removeSegmentPressed(segmentIdx)}>
                <Remove />
              </IconButton>
            );
          return (
            <Grid2 container key={segmentIdx}>
              <RouteInput
                segment={segment}
                errors={inputErrors}
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
        <Button variant="contained" onClick={calculatePressed}>
          Calculate
        </Button>
      </Stack>
      <Results calculatedData={calculationOutput} />
    </Container>
  );
}
