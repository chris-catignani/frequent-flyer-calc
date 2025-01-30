"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Grid2, IconButton, Paper, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { EliteStatusInput, RouteInput } from '@/components/input';
import { ExpandMore, Clear, CheckCircle, Cancel, Info } from "@mui/icons-material";
import { SegmentResults } from '@/components/segmentResults';
import { getAirport } from '@/utils/airports';

const FLAG_ENABLE_QANTAS_API = true

export default function Home() {

  const [inputErrors, setInputErrors] = useState({})
  const [eliteStatus, setEliteStatus] = useState('Bronze')
  const [segments, setSegments] = useState([new Segment('', '', '', '')])
  const [tripType, setTripType] = useState("one way")
  const [compareWithQantasCalc, setCompareWithQantasCalc] = useState(false)

  const [isCalculating, setIsCalculating] = useState(false)
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

  const doCalculation = async (theSegments, theEliteStatus, theTripType, theCompareWithQantasCalc) => {
    setIsCalculating(true)
    setCalculationOutput(null)

    if (theTripType === "return") {
      const returnSegments = [...theSegments];

      // add the segments again, but in reverse, with from/to airports flipped
      for(let i = theSegments.length - 1; i >= 0; i--) {
        const {fromAirport, toAirport} = theSegments[i]
        returnSegments.push(
          theSegments[i].clone({fromAirport: toAirport, toAirport: fromAirport})
        )
      }

      setCalculationOutput(
        await calculate(returnSegments, theEliteStatus, theCompareWithQantasCalc)
      );
    } else {
      setCalculationOutput(
        await calculate(theSegments, theEliteStatus, theCompareWithQantasCalc)
      );
    }

    setIsCalculating(false);
  };

  const calculatePressed = () => {
    const errors = validateInput()
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
    } else {
      setInputErrors({});
      doCalculation(segments, eliteStatus, tripType, compareWithQantasCalc);
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
      doCalculation(segments, newEliteStatus, tripType, compareWithQantasCalc)
    }
  }

  const tripTypeToggled = (newTripType) => {
    setTripType(newTripType)

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && validateInput()) {
      doCalculation(segments, eliteStatus, newTripType, compareWithQantasCalc);
    }
  }

  const setCompareWithQantasCalcToggled = (newCompareWithQantasCalc) => {
    setCompareWithQantasCalc(newCompareWithQantasCalc);

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && validateInput()) {
      doCalculation(segments, eliteStatus, tripType, newCompareWithQantasCalc);
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

  const MatchesQantasAPIIcon = ({expectedValue, fieldToCheck}) => {
    if (!compareWithQantasCalc || !calculationOutput || isCalculating) {
      return <></>
    }

    let sumOfQantasAPICalc = 0
    let qantasAPICalcError = null
    calculationOutput.segmentResults.forEach((segmentResult) => {
      if(segmentResult.qantasAPIResults?.error) {
        qantasAPICalcError = segmentResult.qantasAPIResults?.error
      } else {
        sumOfQantasAPICalc +=
          segmentResult.qantasAPIResults?.qantasData?.[fieldToCheck];
      }
    })

    if (qantasAPICalcError) {
      return (
        <Tooltip title="Qantas Calculator failed to calculate a result">
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <Info color="warning" />
          </IconButton>
        </Tooltip>
      )
    } else if(expectedValue === sumOfQantasAPICalc) {
      return (
        <Tooltip title="Matches Qantas Calculator">
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <CheckCircle color="success" />
          </IconButton>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Does not match Qantas Calculator">
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <Cancel color="error" />
          </IconButton>
        </Tooltip>
      );
    }
  }

  const TotalQantasPointsEarned = ({ calculationOutput }) => {
    return (
      <Grid2
        container
        justifyContent="center"
        alignItems="center"
        spacing={1}
        direction={"row"}
      >
        <Typography variant="h5">
          Qantas Points Earned:{" "}
          {calculationOutput?.qantasPoints?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.qantasPoints}
          fieldToCheck={"qantasPoints"}
        />
      </Grid2>
    );
  };

  const TotalStatusCreditsEarned = ({ calculationOutput }) => {
    return (
      <Grid2
        container
        justifyContent="center"
        alignItems="center"
        spacing={1}
        direction={"row"}
      >
        <Typography variant="h5">
          Status Credits Earned:{" "}
          {calculationOutput?.statusCredits?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.statusCredits}
          fieldToCheck={"statusCredits"}
        />
      </Grid2>
    );
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
              sx={{
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Button variant="contained" onClick={addSegmentPressed}>
                Add Segment
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={calculatePressed}
                loading={isCalculating}
                sx={{ borderRadius: "28px" }}
              >
                Calculate
              </Button>
              <Grid2
                container
                direction="row"
                sx={{
                  alignItems: "center",
                  visibility: FLAG_ENABLE_QANTAS_API ? "" : "hidden"
                }}
              >
                <Switch
                  checked={compareWithQantasCalc}
                  onChange={(event) =>
                    setCompareWithQantasCalcToggled(event.target.checked)
                  }
                  disabled={!FLAG_ENABLE_QANTAS_API}
                />
                <Tooltip title="Compare results with the Qantas website calculator">
                  <Typography>
                    Compare With
                    <br />
                    Qantas Calculator
                  </Typography>
                </Tooltip>
              </Grid2>
            </Grid2>
          </Box>
        </Paper>
      </Box>
      <Box mt={5}>
        <TotalQantasPointsEarned calculationOutput={calculationOutput} />
        <TotalStatusCreditsEarned calculationOutput={calculationOutput} />
      </Box>
      <ErrorDisplay calculationOutput={calculationOutput} />
      {calculationOutput && (
        <Accordion sx={{ "&:before": { height: "0px" } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span" width="100%" textAlign="center">
              Expand to see detailed calculation per segment
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SegmentResults
              calculatedData={calculationOutput}
              compareWithQantasCalc={compareWithQantasCalc}
            />
          </AccordionDetails>
        </Accordion>
      )}
      <Typography mt={5}>
        Calculations based on{" "}
        <a
          href="https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
          target="_blank"
        >
          Qantas/Jetstar
        </a>{" "}
        and{" "}
        <a
          href="https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
          target="_blank"
        >
          Partner
        </a>{" "}
        earning tables as of January 2025.
      </Typography>
      <Typography>
        This webpage is not affiliated with Qantas Airlines.
      </Typography>
      <Typography mt={5}>
        Currently unsupported items:
        <br />- Jetstar connecting flights in New Zealand (all else is fine)
        <br />- Japan Airlines domestic flights (international is fine)
        <br />- Autocomplete for airport input, only accepts iata codes for now
        <br />- All Non-oneworld partners are not implemented
      </Typography>
    </Grid2>
  );
}
