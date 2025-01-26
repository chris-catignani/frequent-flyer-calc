"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Box, Button, Grid2, IconButton, Paper, Typography } from '@mui/material';
import { EliteStatusInput, RouteInput } from '@/components/input';
import { Remove } from '@mui/icons-material';
import { Results } from '@/components/results';

export default function Home() {

  const [inputErrors, setInputErrors] = useState(false)
  const [eliteStatus, setEliteStatus] = useState('Bronze')
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
      setCalculationOutput(calculate(segments, eliteStatus));
    }
  }

  const addSegmentPressed = () => {
    setSegments([...segments, new Segment("", "", "", "")]);

    // clear calculation output
    setCalculationOutput(null);
  }

  const removeSegmentPressed = (segmentIdx) => {
    const newSegments = [...segments];
    newSegments.splice(segmentIdx, 1);
    setSegments(newSegments);

    // clear calculation output
    setCalculationOutput(null);
  }

  const RouteInputButton = ({ segments, segmentIdx }) => {
    if (segments.length === 1) {
      return (
        <IconButton disabled sx={{ visibility: 'hidden' }}>
          <Remove />
        </IconButton>
      );
    } else {
      return (
        <IconButton
          sx={{ mb: 2 }}
          onClick={() => removeSegmentPressed(segmentIdx)}
        >
          <Remove />
        </IconButton>
      );
    }
  };

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
        <Grid2
          container
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Typography>Enter your itinerary segments below:</Typography>
          <Box></Box>
          <EliteStatusInput
            eliteStatus={eliteStatus}
            onChange={(value) => setEliteStatus(value)}
          />
        </Grid2>

        <Paper elevation={3}>
          <Box mt={2} p={2}>
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
                  <RouteInputButton
                    segments={segments}
                    segmentIdx={segmentIdx}
                  />
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
        </Paper>
      </Box>
      <Results calculatedData={calculationOutput} />
    </Grid2>
  );
}
