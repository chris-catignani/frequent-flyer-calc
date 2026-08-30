'use client';

import React, { useEffect, useState } from 'react';
import { calculate } from '@/app/_shared/calculators/qantas/calculator';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import { getAirport } from '@/app/_shared/utils/airports';
import { Segment } from '@/app/_shared/models/segment';
import { defaultSegmentInput, SegmentInput } from '@/app/_shared/models/segmentInput';
import {
  JAL_AIRLINES,
  JETSTAR_AIRLINES,
  PARTNER_NON_ONEWORLD_AIRLINES,
  PARTNER_ONEWORLD_AIRLINES,
} from '@/app/_shared/models/qantasConstants';
import {
  createUrlQueryParams,
  parseUrlQueryParams,
} from '@/app/_shared/utils/segmentInputUrlParser';
import { useSearchParams } from 'next/navigation';
import {
  deleteAllSavedCalculations,
  deleteSavedCalculationAtIdx,
  getSavedCalculations,
  saveCalculation,
  type SavedCalculation,
} from '@/app/_shared/utils/recentCalculations';
import { EliteStatusInput } from '@/app/qantas/_components/input';
import { RecentCalculationSelection } from '@/app/qantas/_components/recentCalculations';
import { AdvancedInput } from '@/app/_shared/components/advancedInput';
import { ResultsSummary } from '@/app/qantas/_components/resultsSummary';
import { SegmentResults } from '@/app/qantas/_components/segmentResults';
import { Footer } from '@/app/qantas/_components/footer';
import { ChangeLog } from '@/app/qantas/_components/changeLog';
import {
  buildAirlineOptions,
  SegmentInputList,
  validate,
  type SegmentErrors,
} from '@/app/_shared/components/segmentInput';
import { QANTAS_GRP_AIRLINES } from '@/app/_shared/models/constants';
import { trackCalculationCompleted, trackQantasApiMismatch } from '@/app/_shared/utils/analytics';
import type { CalculationResult } from '@/types/calculator';

const FLAG_ENABLE_QANTAS_API = true;

export default function Qantas() {
  const searchParams = useSearchParams();

  const [inputErrors, setInputErrors] = useState<SegmentErrors>({});
  const [eliteStatus, setEliteStatus] = useState<string>('Bronze');
  const [segmentInputs, setSegmentInputs] = useState<SegmentInput[]>([defaultSegmentInput]);
  const [tripType, setTripType] = useState<string>('one way');
  const [compareWithQantasCalc, setCompareWithQantasCalc] = useState<boolean>(false);

  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationOutput, setCalculationOutput] = useState<CalculationResult | null>(null);

  // if we entered this page from a deeplink, pull the params and hydrate the page
  useEffect(() => {
    const {
      eliteStatus: urlEliteStatus,
      tripType: urlTripType,
      segmentInputs: urlSegmentInputs,
    } = parseUrlQueryParams(searchParams);

    setAllInputParams(urlEliteStatus, urlTripType, urlSegmentInputs);
    // setAllInputParams is redefined every render but only calls stable setState
    // setters, so it's intentionally left out here - adding it would re-run this
    // hydration on every render instead of only when the URL's params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // fetch the saved calculations on page load
  useEffect(() => {
    const theSavedCalculations = getSavedCalculations();
    setSavedCalculations(theSavedCalculations);
  }, []);

  const validateInput = () => {
    return validate(segmentInputs);
  };

  const doCalculation = async (
    theEliteStatus: string,
    theTripType: string,
    theCompareWithQantasCalc: boolean,
  ) => {
    setIsCalculating(true);
    setCalculationOutput(null);

    const segments = segmentInputs.map((segmentInput) => {
      return new Segment(
        segmentInput.airline,
        segmentInput.fareClass,
        segmentInput.fromAirport!,
        segmentInput.toAirport!,
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

    // track calculation completed event
    trackCalculationCompleted({
      segmentResults: calculationResult.segmentResults,
      tripType: theTripType,
      eliteStatus: theEliteStatus,
      compareWithQantas: theCompareWithQantasCalc,
      containsErrors: calculationResult.containsErrors,
      totalPoints: calculationResult.airlinePoints,
      totalStatusCredits: calculationResult.elitePoints,
    });

    // track any Qantas API mismatches or errors if comparison was active
    if (theCompareWithQantasCalc && calculationResult.segmentResults) {
      calculationResult.segmentResults.forEach((segmentResult) => {
        const qantasData = segmentResult.qantasAPIResults?.qantasData;
        const qantasError = segmentResult.qantasAPIResults?.error as
          | Error
          | { message?: string }
          | undefined;

        if (qantasError) {
          trackQantasApiMismatch({
            segment: segmentResult.segment,
            ourPoints: Number(segmentResult.airlinePoints) || 0,
            ourStatusCredits: Number(segmentResult.elitePoints) || 0,
            qantasPoints: null,
            qantasStatusCredits: null,
            qantasError: qantasError.message || String(qantasError),
            eliteStatus: theEliteStatus,
            tripType: theTripType,
          });
        } else if (qantasData) {
          const ourPoints = Number(segmentResult.airlinePoints) || 0;
          const ourStatusCredits = Number(segmentResult.elitePoints) || 0;
          const qantasPoints = Number(qantasData.airlinePoints) || 0;
          const qantasStatusCredits = Number(qantasData.elitePoints) || 0;

          const pointsMismatch = ourPoints !== qantasPoints;
          const statusCreditsMismatch = ourStatusCredits !== qantasStatusCredits;

          if (pointsMismatch || statusCreditsMismatch) {
            trackQantasApiMismatch({
              segment: segmentResult.segment,
              ourPoints,
              ourStatusCredits,
              qantasPoints,
              qantasStatusCredits,
              qantasError: null,
              eliteStatus: theEliteStatus,
              tripType: theTripType,
            });
          }
        }
      });
    }

    // save the calculation
    const theSavedCalculations = saveCalculation(segmentInputs, theTripType, theEliteStatus);
    setSavedCalculations(theSavedCalculations);

    // replace the URL query params with the current search params
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    const newParams = createUrlQueryParams(theEliteStatus, segmentInputs, theTripType);
    Object.entries(newParams).forEach(([k, v]) => {
      params.set(k, v);
    });
    if (!searchParams || searchParams.toString() !== params.toString()) {
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

  const setAllInputParams = (
    urlEliteStatus?: string | null,
    urlTripType?: string | null,
    urlSegmentInputs?: SegmentInput[],
  ) => {
    if (urlEliteStatus) {
      setEliteStatus(urlEliteStatus);
    }
    if (urlTripType) {
      setTripType(urlTripType);
    }
    if (urlSegmentInputs) {
      setAllSegmentInputs(urlSegmentInputs);
    }
  };

  const setAllSegmentInputs = (theSegmentInputs: SegmentInput[]) => {
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
        for (const property of [
          'airline',
          'fromAirportText',
          'toAirportText',
          'fareClass',
        ] as const) {
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

  const deleteSegmentPressed = (segmentInputIdx: number) => {
    const newSegmentInputs = [...segmentInputs];
    newSegmentInputs.splice(segmentInputIdx, 1);
    setSegmentInputs(newSegmentInputs);

    // clear calculation output
    setCalculationOutput(null);
  };

  const segmentInputChanged = (segmentInputIdx: number, segmentInput: SegmentInput) => {
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

  const segmentsReordered = (originIdx: number, targetIdx: number) => {
    const newSegmentInputs = [...segmentInputs];
    const itemToMove = newSegmentInputs[originIdx];
    newSegmentInputs.splice(originIdx, 1);
    newSegmentInputs.splice(targetIdx, 0, itemToMove);
    setSegmentInputs(newSegmentInputs);
  };

  const eliteStatusSelected = (newEliteStatus: string) => {
    setEliteStatus(newEliteStatus);

    // if we have calculated data, recalculate with new elite status level
    if (calculationOutput && Object.keys(validateInput()).length === 0) {
      doCalculation(newEliteStatus, tripType, compareWithQantasCalc);
    }
  };

  const tripTypeToggled = (newTripType: string) => {
    setTripType(newTripType);

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && Object.keys(validateInput()).length === 0) {
      doCalculation(eliteStatus, newTripType, compareWithQantasCalc);
    }
  };

  const setCompareWithQantasCalcToggled = (newCompareWithQantasCalc: boolean) => {
    setCompareWithQantasCalc(newCompareWithQantasCalc);

    // if we have calculated data, recalculate with new return/oneway status
    if (calculationOutput && Object.keys(validateInput()).length === 0) {
      doCalculation(eliteStatus, tripType, newCompareWithQantasCalc);
    }
  };

  const recentCalculationClicked = (idx: number) => {
    const savedCalculation = savedCalculations[idx];
    setAllInputParams(
      savedCalculation.eliteStatus,
      savedCalculation.tripType,
      savedCalculation.segmentInputs,
    );
  };

  const recentCalculationDeleteClicked = (idx: number) => {
    const theSavedCalculations = deleteSavedCalculationAtIdx(idx);
    setSavedCalculations(theSavedCalculations);
  };

  const clearAllRecentCalculationsClicked = () => {
    const theSavedCalculations = deleteAllSavedCalculations();
    setSavedCalculations(theSavedCalculations);
  };

  const QantasApiDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
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

  const CompareWithQantasAPISwitch: React.FC = () => {
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
          data-testid="compare-with-qantas-switch"
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

  const ErrorDisplay: React.FC<{ calculationOutput: CalculationResult | null }> = ({
    calculationOutput,
  }) => {
    if (!calculationOutput || !calculationOutput.containsErrors) {
      return <></>;
    }

    return (
      <Alert variant="filled" severity="error">
        There are errors in the calculation. See the details below.
      </Alert>
    );
  };

  const InfoDisplay: React.FC<{ calculationOutput: CalculationResult | null }> = ({
    calculationOutput,
  }) => {
    if (!calculationOutput) {
      return <></>;
    }

    const infoAlerts: React.ReactNode[] = [];

    const jetstarResults = calculationOutput.segmentResults.filter((segmentResult) => {
      return JETSTAR_AIRLINES.has(segmentResult.segment.airline);
    });
    const jetstarDiscountEconomyResults = jetstarResults.filter((jetstarResult) => {
      return jetstarResult.fareEarnCategory === 'discountEconomy';
    });
    const jalResults = calculationOutput.segmentResults.filter((segmentResult) => {
      return JAL_AIRLINES.has(segmentResult.segment.airline);
    });

    if (jetstarResults.length !== 0) {
      infoAlerts.push(
        <Alert severity="info" key="jetstart-alerts">
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
        </Alert>,
      );
    }

    if (jalResults.length !== 0) {
      infoAlerts.push(
        <Alert severity="info" key="jal-alerts">
          <Typography>
            Japan Airlines flights within Japan are awarded points based on information provided by
            Japan Airlines. Qantas does not define the earning rules for these flights
          </Typography>
        </Alert>,
      );
    }

    if (infoAlerts.length === 0) {
      return <></>;
    }
    return <>{infoAlerts}</>;
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
                  data-testid="trip-type-toggle"
                  color="primary"
                  size="small"
                  value={tripType}
                  exclusive
                  onChange={(_event, value) => {
                    if (value) tripTypeToggled(value);
                  }}
                >
                  <ToggleButton data-testid="trip-type-oneway" value="one way">
                    One Way
                  </ToggleButton>
                  <ToggleButton data-testid="trip-type-return" value="return">
                    Return
                  </ToggleButton>
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
                  <Button
                    data-testid="add-segment-button"
                    variant="contained"
                    onClick={addSegmentPressed}
                  >
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
                    data-testid="calculate-button"
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
        <Box mt={5} width="100%" px={{ xs: 2, sm: 0 }}>
          <ChangeLog />
        </Box>
      </Grid>
      <Footer />
    </Container>
  );
}
