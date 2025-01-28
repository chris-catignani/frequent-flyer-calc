"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Fab, Grid2, IconButton, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { EliteStatusInput, RouteInput } from '@/components/input';
import { ExpandMore, Clear } from "@mui/icons-material";
import { Results } from '@/components/results';
import { getAirport } from '@/utils/airports';

export default function Home() {

  const [inputErrors, setInputErrors] = useState({})
  const [eliteStatus, setEliteStatus] = useState('Bronze')
  const [segments, setSegments] = useState([new Segment('', '', '', '')])
  const [tripType, setTripType] = useState("one way")
  const [calculationOutput, setCalculationOutput] = useState();

  const validateInput = () => {
    const errors = {}

    const addError = (segmentIdx, fieldName, error) => {
      if (!errors[segmentIdx]) {
        errors[segmentIdx] = {};
      }
      errors[segmentIdx][fieldName] = error
    }

    segments.forEach((segment, idx) => {
      if(!segment.airline) {
        addError(idx, 'airline', 'Required')
      }
      if (!segment.fromAirport) {
        addError(idx, "fromAirport", "Required");
      }
      if (!segment.toAirport) {
        addError(idx, "toAirport", "Required");
      }
      if (!segment.fareClass) {
        addError(idx, "fareClass", "Required");
      }

      if (segment.fromAirport && !getAirport(segment.fromAirport)) {
        addError(idx, "fromAirport", "Invalid IATA");
      }
      if (segment.toAirport && !getAirport(segment.toAirport)) {
        addError(idx, "toAirport", "Invalid IATA");
      }
    })

    return errors;
  }

  const doCalculation = (theSegments, theEliteStatus, theTripType) => {
    if (theTripType === "return") {
      const returnSegments = [...theSegments];

      // add the segments again, but in reverse, with from/to airports flipped
      for(let i = theSegments.length - 1; i >= 0; i--) {
        const {fromAirport, toAirport} = theSegments[i]
        returnSegments.push(
          theSegments[i].clone({fromAirport: toAirport, toAirport: fromAirport})
        )
      }

      setCalculationOutput(calculate(returnSegments, theEliteStatus));
    } else {
      setCalculationOutput(calculate(theSegments, theEliteStatus));
    }
  };

  const calculatePressed = () => {
    const errors = validateInput()
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
    } else {
      setInputErrors({});
      doCalculation(segments, eliteStatus, tripType);
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

  const segmentChanged = (segmentIdx, segment) => {
    const newSegments = [...segments];
    newSegments[segmentIdx] = segment;
    setSegments(newSegments);

    // if input changes, ensure calculated data is voided
    setCalculationOutput(null);
  }

  const eliteStatusSelected = (newEliteStatus) => {
    setEliteStatus(newEliteStatus);

    // if we have calculated data, recalculate with new elite status level
    if (calculationOutput && validateInput()) {
      doCalculation(segments, newEliteStatus, tripType)
    }
  }

  const tripTypeToggled = (newTripType) => {
    setTripType(newTripType)

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && validateInput()) {
      doCalculation(segments, eliteStatus, newTripType);
    }
  }

  const RouteInputButton = ({ segments, segmentIdx }) => {
    if (segments.length === 1) {
      return (
        // Dummy icon to maintain space for when we show icons
        <IconButton disabled sx={{ visibility: 'hidden', pr: 0 }}>
          <Clear />
        </IconButton>
      );
    } else {
      return (
        <IconButton
          sx={{ mb: 3, pr: 0, '&:hover': { backgroundColor: 'inherit', boxShadow: 'none' } }}
          onClick={() => removeSegmentPressed(segmentIdx)}
        >
          <Clear />
        </IconButton>
      );
    }
  };

  const ErrorDisplay = ({ calculationOutput }) => {
    if (!calculationOutput || !calculationOutput.containsErrors) {
      return <></>
    }

    return (
    <Alert variant="filled" severity="error">
      There are errors in the calculation. Expand the details below for details
    </Alert>
    )
  }

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
        <Paper elevation={3}>
          <Grid2
            container
            direction="row"
            p={2}
            sx={{
              justifyContent: "space-between",
            }}
          >
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={tripType}
              exclusive
              onChange={(event) => tripTypeToggled(event.target.value)}
            >
              <ToggleButton value="one way">One Way</ToggleButton>
              <ToggleButton value="return">Return</ToggleButton>
            </ToggleButtonGroup>
            <EliteStatusInput
              eliteStatus={eliteStatus}
              onChange={(value) => eliteStatusSelected(value)}
          />
          </Grid2>
          <Box p={2}>
            {segments.map((segment, segmentIdx) => {
              return (
                <Grid2 container key={segmentIdx}>
                  <RouteInput
                    segment={segment}
                    errors={inputErrors[segmentIdx] || {}}
                    onChange={(segment) => segmentChanged(segmentIdx, segment)}
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
              <Button disabled variant="contained" sx={{ visibility: 'hidden' }}>
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
      <ErrorDisplay calculationOutput={calculationOutput} />
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
      <Typography mt={5}>
        Calculations based on Qantas earnings tables as of January 2025
      </Typography>
      <Box mt={5}>
        <Typography>Currently unsupported items:</Typography>
        <Typography> - Jetstar connecting flights in New Zealand (all else is fine)</Typography>
        <Typography> - Japan Airlines domestic flights (international is fine)</Typography>
        <Typography> - Autocomplete for airport input, only accepts iata codes for now</Typography>
        <Typography> - All Non-oneworld partners are not implemented</Typography>
      </Box>
    </Grid2>
  );
}
