"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Fab, Grid2, IconButton, Paper, Typography } from '@mui/material';
import { EliteStatusInput, RouteInput } from '@/components/input';
import { Remove, ExpandMore } from "@mui/icons-material";
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

  const eliteStatusSelected = (newEliteStatus) => {
    setEliteStatus(newEliteStatus);

    // if we have calculated data, recalculate with new elite status level
    if (calculationOutput && validateInput()) {
      setCalculationOutput(calculate(segments, newEliteStatus));
    }
  }

  const RouteInputButton = ({ segments, segmentIdx }) => {
    if (segments.length === 1) {
      return (
        // Dummy icon to maintain space for when we show icons
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
      m={2}
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
            onChange={(value) => eliteStatusSelected(value)}
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
              mt={1}
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button variant="contained" onClick={addSegmentPressed}>
                Add Segment
              </Button>
              <Fab
                variant="extended"
                color="primary"
                onClick={calculatePressed}
              >
                Calculate
              </Fab>
              {/* The button below exists to center the Calculate button above */}
              <Button disabled sx={{ visibility: "hidden" }}>
                Add Segment
              </Button>
            </Grid2>
          </Box>
        </Paper>
      </Box>
      <Box mt={5}>
        <Typography variant="h5">
          Qantas Points Earned: {calculationOutput?.qantasPoints?.toLocaleString()}
        </Typography>
        <Typography variant="h5">
          Status Credits Earned: {calculationOutput?.statusCredits?.toLocaleString()}
        </Typography>
      </Box>
      {calculationOutput &&
        <Accordion sx={{ '&:before':{height:'0px'}}}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span" width='100%' textAlign='center'>
              Expand to see detailed calculation per segment
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Results calculatedData={calculationOutput} />
          </AccordionDetails>
        </Accordion>
      }
    </Grid2>
  );
}
