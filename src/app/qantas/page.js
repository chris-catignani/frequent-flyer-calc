'use client';

import { calculate } from '@/app/_shared/calculators/qantas/calculator';
import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Dialog, DialogTitle, Grid, IconButton, Paper, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'; // prettier-ignore
import { Info } from '@mui/icons-material';
import { getAirport } from '@/app/_shared/utils/airports';
import { Segment } from '@/app/_shared/models/segment';
import { defaultSegmentInput, SegmentInput } from '@/app/_shared/models/segmentInput';
import { JETSTAR_AIRLINES } from '@/app/_shared/models/qantasConstants';
import {
  createUrlQueryParams,
  parseUrlQueryParams,
} from '@/app/_shared/utils/segmentInputUrlParser';
import { useSearchParams } from 'next/navigation';
import { deleteAllSavedCalculations, deleteSavedCalculationAtIdx, getSavedCalculations, saveCalculation } from '@/app/_shared/utils/recentCalculations'; // prettier-ignore
import { EliteStatusInput } from './_components/input';
import { RecentCalculationSelection } from './_components/recentCalculations';
import { AdvancedInput } from '../_shared/components/advancedInput';
import { ResultsSummary } from './_components/resultsSummary';
import { SegmentResults } from './_components/segmentResults';
import { Footer } from './_components/footer';
import {
  buildAirlineOptions,
  SegmentInputList,
  validate,
} from '../_shared/components/segmentInput';
import { QANTAS_GRP_AIRLINES } from '../_shared/models/constants';
import { PARTNER_NON_ONEWORLD_AIRLINES, PARTNER_ONEWORLD_AIRLINES } from './_models/contants';

const FLAG_ENABLE_QANTAS_API = true;

export default function Qantas() {
  const searchParams = useSearchParams();

  const [inputErrors, setInputErrors] = useState({});
  const [eliteStatus, setEliteStatus] = useState('Bronze');
  const [segmentInputs, setSegmentInputs] = useState([defaultSegmentInput]);
  const [tripType, setTripType] = useState('one way');
  const [compareWithQantasCalc, setCompareWithQantasCalc] = useState(false);

  const [savedCalculations, setSavedCalculations] = useState([]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationOutput, setCalculationOutput] = useState();

  // if we entered this page from a deeplink, pull the params and hydrate the page
  useEffect(() => {
    const { eliteStatus, tripType, segmentInputs } = parseUrlQueryParams(searchParams);

    setAllInputParams(eliteStatus, tripType, segmentInputs);
  }, [searchParams]);

  // fetch the saved calculations on page load
  useEffect(() => {
    const theSavedCalculations = getSavedCalculations();
    setSavedCalculations(theSavedCalculations);
  }, []);

  const validateInput = () => {
    return validate(segmentInputs);
  };

  const doCalculation = async (theEliteStatus, theTripType, theCompareWithQantasCalc) => {
    setIsCalculating(true);
    setCalculationOutput(null);

    const segments = segmentInputs.map((segmentInput) => {
      return new Segment(
        segmentInput.airline,
        segmentInput.fareClass,
        segmentInput.fromAirport,
        segmentInput.toAirport,
      );
    });

    if (theTripType === 'return') {
      // add the segments in reverse, with from/to airports flipped
      for (let i = segments.length - 1; i >= 0; i--) {
        const { fromAirport, toAirport } = segments[i];
        segments.push(segments[i].clone({ fromAirport: toAirport, toAirport: fromAirport }));
      }
    }

    const calculationResult = await calculate(
      segments,
      theEliteStatus,
      0.0, // priceLessTaxes ignored for qantas
      theCompareWithQantasCalc,
    );
    setCalculationOutput(calculationResult);

    // save the calculation
    const theSavedCalculations = saveCalculation(segmentInputs, theTripType, theEliteStatus);
    setSavedCalculations(theSavedCalculations);

    // replace the URL query params with the current search params
    const params = new URLSearchParams(searchParams.toString());
    const newParams = createUrlQueryParams(eliteStatus, segmentInputs, tripType);
    Object.entries(newParams).forEach(([k, v]) => {
      params.set(k, v);
    });
    if (searchParams.toString() !== params.toString()) {
      window.history.pushState(null, '', `?${params.toString()}`);
    }

    setIsCalculating(false);
  };

  const calculatePressed = () => {
    const errors = validateInput();
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
    } else {
      setInputErrors({});
      doCalculation(eliteStatus, tripType, compareWithQantasCalc);
    }
  };

  const setAllInputParams = (eliteStatus, tripType, segmentInputs) => {
    if (eliteStatus) {
      setEliteStatus(eliteStatus);
    }
    if (tripType) {
      setTripType(tripType);
    }
    if (segmentInputs) {
      setAllSegmentInputs(segmentInputs);
    }
  };

  const setAllSegmentInputs = (theSegmentInputs) => {
    theSegmentInputs.forEach((segmentInput) => {
      segmentInput.fromAirport = getAirport(segmentInput.fromAirportText);
      segmentInput.toAirport = getAirport(segmentInput.toAirportText);
    });

    setSegmentInputs(theSegmentInputs);

    let clearCalculation = false;
    if (theSegmentInputs.length !== segmentInputs.length) {
      clearCalculation = true;
    } else {
      for (let i = 0; i < theSegmentInputs.length; i++) {
        for (const property of ['airline', 'fromAirportText', 'toAirportText', 'fareClass']) {
          if (theSegmentInputs[i][property] !== segmentInputs[i][property]) {
            clearCalculation = true;
            break;
          }
        }
      }
    }

    if (clearCalculation) {
      setCalculationOutput(null);
    }
  };

  const addSegmentPressed = () => {
    const previousSegment = segmentInputs[segmentInputs.length - 1];
    setAllSegmentInputs([
      ...segmentInputs,
      new SegmentInput(previousSegment.airline, '', previousSegment.toAirportText, ''),
    ]);
  };

  const deleteSegmentPressed = (segmentInputIdx) => {
    const newSegmentInputs = [...segmentInputs];
    newSegmentInputs.splice(segmentInputIdx, 1);
    setSegmentInputs(newSegmentInputs);

    // clear calculation output
    setCalculationOutput(null);
  };

  const segmentInputChanged = (segmentInputIdx, segmentInput) => {
    const oldSegmentInput = segmentInputs[segmentInputIdx];

    if (oldSegmentInput.fromAirportText !== segmentInput.fromAirportText) {
      segmentInput.fromAirport =
        segmentInput.fromAirportText?.length === 3
          ? getAirport(segmentInput.fromAirportText)
          : null;
    }

    if (oldSegmentInput.toAirportText !== segmentInput.toAirportText) {
      segmentInput.toAirport =
        segmentInput.toAirportText?.length === 3 ? getAirport(segmentInput.toAirportText) : null;
    }

    const newSegmentInputs = [...segmentInputs];
    newSegmentInputs[segmentInputIdx] = segmentInput;
    setSegmentInputs(newSegmentInputs);

    // if input changes, ensure calculated data is voided
    setCalculationOutput(null);
  };

  const segmentsReordered = (originIdx, targetIdx) => {
    const newSegmentInputs = [...segmentInputs];
    const itemToMove = newSegmentInputs[originIdx];
    newSegmentInputs.splice(originIdx, 1);
    newSegmentInputs.splice(targetIdx, 0, itemToMove);
    setSegmentInputs(newSegmentInputs);
  };

  const eliteStatusSelected = (newEliteStatus) => {
    setEliteStatus(newEliteStatus);

    // if we have calculated data, recalculate with new elite status level
    if (calculationOutput && validateInput()) {
      doCalculation(newEliteStatus, tripType, compareWithQantasCalc);
    }
  };

  const tripTypeToggled = (newTripType) => {
    setTripType(newTripType);

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && validateInput()) {
      doCalculation(eliteStatus, newTripType, compareWithQantasCalc);
    }
  };

  const setCompareWithQantasCalcToggled = (newCompareWithQantasCalc) => {
    setCompareWithQantasCalc(newCompareWithQantasCalc);

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && validateInput()) {
      doCalculation(eliteStatus, tripType, newCompareWithQantasCalc);
    }
  };

  const recentCalculationClicked = (idx) => {
    const savedCalculation = savedCalculations[idx];
    setAllInputParams(
      savedCalculation.eliteStatus,
      savedCalculation.tripType,
      savedCalculation.segmentInputs,
    );
  };

  const recentCalculationDeleteClicked = (idx) => {
    const theSavedCalculations = deleteSavedCalculationAtIdx(idx);
    setSavedCalculations(theSavedCalculations);
  };

  const clearAllRecentCalculationsClicked = () => {
    const theSavedCalculations = deleteAllSavedCalculations();
    setSavedCalculations(theSavedCalculations);
  };

  const QantasApiDialog = ({ open, onClose }) => {
    return (
      <Dialog onClose={onClose} open={open}>
        <DialogTitle>Compare with Qantas</DialogTitle>
        <Grid container direction="column" mx={2} mb={2}>
          <Typography>
            This enables us to compare our results with Qantas&apos;s website calculator results.
          </Typography>
          <Typography>
            This makes an API call to Qantas&apos;s website, and as a result, can be slow.
          </Typography>
        </Grid>
      </Dialog>
    );
  };

  const CompareWithQantasAPISwitch = () => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <Grid
        container
        direction="row"
        wrap="nowrap"
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          visibility: FLAG_ENABLE_QANTAS_API ? '' : 'hidden',
        }}
      >
        <Switch
          checked={compareWithQantasCalc}
          onChange={(event) => setCompareWithQantasCalcToggled(event.target.checked)}
          disabled={!FLAG_ENABLE_QANTAS_API}
        />
        <Typography>
          Compare With
          <br />
          Qantas&apos;s Calculator
        </Typography>
        <IconButton size="small" sx={{ py: 0 }} onClick={handleClickOpen}>
          <Info />
        </IconButton>
        <QantasApiDialog open={open} onClose={handleClose} />
      </Grid>
    );
  };

  const ErrorDisplay = ({ calculationOutput }) => {
    if (!calculationOutput || !calculationOutput.containsErrors) {
      return <></>;
    }

    return (
      <Alert variant="filled" severity="error">
        There are errors in the calculation. See the details below.
      </Alert>
    );
  };

  const InfoDisplay = ({ calculationOutput }) => {
    if (!calculationOutput) {
      return <></>;
    }

    const jetstarResults = calculationOutput.segmentResults.filter((segmentResult) => {
      return JETSTAR_AIRLINES.has(segmentResult.segment.airline);
    });
    const jetstarDiscountEconomyResults = jetstarResults.filter((jetstarResult) => {
      return jetstarResult.fareEarnCategory === 'discountEconomy';
    });

    if (jetstarResults.length === 0) {
      return <></>;
    } else {
      return (
        <Alert severity="info">
          {jetstarDiscountEconomyResults.length > 0 && (
            <>
              <Typography>
                If you are travelling on a domestic Jetstar flight within New Zealand that connects
                to an international Jetstar flight, you will not earn Qantas Points or Status
                Credits unless you purchase an Economy Starter Plus, Flex, Flex Plus, Economy
                Starter Max or Business Max fare with Jetstar.
              </Typography>
              <br />
            </>
          )}
          <Typography>
            Qantas Points and Status Credits are not earned when travelling in the Economy Cabin on
            flights with a Jetstar (JQ) or Jetstar Japan (GK) flight number as part of a Qantas
            International fare or when a Jetstar flight voucher has been selected in lieu of Points
            and Status Credits.
          </Typography>
        </Alert>
      );
    }
  };

  return (
    <Container maxWidth="md" disableGutters>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        my={2}
        mx={{ xs: 0, sm: 2 }}
      >
        <Typography variant="h4" textAlign="center">
          Qantas Points and Status Credits Calculator
        </Typography>

        <Box mt={3} width="100%">
          <Paper elevation={3}>
            <Grid
              container
              direction="row"
              p={2}
              sx={{
                justifyContent: 'space-between',
              }}
            >
              <Grid>
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
              </Grid>
              <Grid order={{ xs: 2, sm: 3 }}>
                <EliteStatusInput
                  eliteStatus={eliteStatus}
                  onChange={(value) => eliteStatusSelected(value)}
                />
              </Grid>
            </Grid>
            <Box p={2}>
              <SegmentInputList
                segmentInputs={segmentInputs}
                errors={inputErrors}
                airlineOptions={[
                  ...buildAirlineOptions(Object.keys(QANTAS_GRP_AIRLINES), 'Qantas Group Airlines'),
                  ...buildAirlineOptions(PARTNER_ONEWORLD_AIRLINES, 'oneworld Partner Airlines'),
                  ...buildAirlineOptions(PARTNER_NON_ONEWORLD_AIRLINES, 'Other Partner Airlines'),
                ]}
                onDeleteSegmentPressed={deleteSegmentPressed}
                onSegmentInputChanged={segmentInputChanged}
                onSegmentsReordered={segmentsReordered}
              />

              <Grid
                container
                columns={{ xs: 8, sm: 12 }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Grid size={4}>
                  <Button variant="contained" onClick={addSegmentPressed}>
                    Add Segment
                  </Button>
                </Grid>
                <Grid
                  container
                  size={{ xs: 8, sm: 4 }}
                  order={{ xs: 3, sm: 2 }}
                  sx={{
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={calculatePressed}
                    loading={isCalculating}
                    sx={{ borderRadius: '28px' }}
                  >
                    Calculate
                  </Button>
                </Grid>
                <Grid size={4} order={{ xs: 2, sm: 3 }}>
                  <CompareWithQantasAPISwitch />
                </Grid>
              </Grid>
            </Box>
            {savedCalculations && savedCalculations.length > 0 && (
              <Box pt={0} pb={2} px={2}>
                <RecentCalculationSelection
                  recentCalculations={savedCalculations}
                  onRecentCalculationClick={recentCalculationClicked}
                  onRecentCalcutionDeleteClick={recentCalculationDeleteClicked}
                  onClearAllClick={clearAllRecentCalculationsClicked}
                />
              </Box>
            )}
            <Box pt={0} pb={2} px={{ xs: 0, sm: 2 }}>
              <AdvancedInput setSegmentInputs={setAllSegmentInputs} />
            </Box>
          </Paper>
        </Box>
        <ResultsSummary
          mt={5}
          calculationOutput={calculationOutput}
          compareWithQantasCalc={compareWithQantasCalc}
          isCalculating={isCalculating}
        />
        <ErrorDisplay calculationOutput={calculationOutput} />
        <InfoDisplay calculationOutput={calculationOutput} />
        <SegmentResults
          calculatedData={calculationOutput}
          compareWithQantasCalc={compareWithQantasCalc}
        />
      </Grid>
      <Footer />
    </Container>
  );
}
