"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Box, Button, Container, Grid2, IconButton, Typography } from '@mui/material';
import { RouteInput } from '@/components/input';
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
    <Grid2
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Typography variant="h4">
        Qantas Points and Status Credit Calculator
      </Typography>

      <Box mt={3}>
        <Typography mb={1}>Enter your itinerary segments below:</Typography>
        {segments.map((segment, segmentIdx) => {
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
              {segments.length > 1 && (
                <IconButton
                  sx={{ mb: 2 }}
                  onClick={() => removeSegmentPressed(segmentIdx)}
                >
                  <Remove />
                </IconButton>
              )}
            </Grid2>
          );
        })}

        <Grid2
          container
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button variant="contained" onClick={addSegmentPressed}>
            Add Segment
          </Button>
          <Button variant="contained" onClick={calculatePressed}>
            Calculate
          </Button>
          <Box></Box>
        </Grid2>
      </Box>
      <Results calculatedData={calculationOutput} />
    </Grid2>
  );
}
