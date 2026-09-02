"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { JAL_AIRLINES, JETSTAR_AIRLINES } from "@/calculators/qantas/constants";
import { EliteStatusInput } from "@/components/qantas/input";
import { RecentCalculationSelection } from "@/components/qantas/recentCalculations";
import { AdvancedInput } from "@/components/form/advancedInput";
import { ResultsSummary } from "@/components/qantas/resultsSummary";
import { SegmentResults } from "@/components/qantas/segmentResults";
import { Footer } from "@/components/qantas/footer";
import { ChangeLog } from "@/components/qantas/changeLog";
import { FaqAndInfo } from "@/components/qantas/faqAndInfo";
import { qantasProgram } from "@/calculators/qantas";
import { SegmentInputList } from "@/components/form/segmentInput";
import { useCalculator } from "@/hooks/useCalculator";
import type { CalculationResult } from "@/types/calculator";

const FLAG_ENABLE_QANTAS_API = true;

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

const CompareWithQantasAPISwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      sx={{
        alignItems: "center",
        justifyContent: { xs: "center", sm: "flex-end" },
        visibility: FLAG_ENABLE_QANTAS_API ? "" : "hidden",
      }}
    >
      <Switch
        data-testid="compare-with-qantas-switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={!FLAG_ENABLE_QANTAS_API}
        inputProps={{ "aria-label": "Compare with Qantas website calculator" }}
      />
      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
        Compare With
        <br />
        Qantas&apos;s Calculator
      </Typography>
      <IconButton
        size="small"
        sx={{ py: 0 }}
        onClick={() => setOpen(true)}
        aria-label="Learn more about comparing with Qantas calculator"
      >
        <Info fontSize="small" />
      </IconButton>
      <QantasApiDialog open={open} onClose={() => setOpen(false)} />
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
    return jetstarResult.fareEarnCategory === "discountEconomy";
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
              If you are travelling on a domestic Jetstar flight within New Zealand that connects to
              an international Jetstar flight, you will not earn Qantas Points or Status Credits
              unless you purchase an Economy Starter Plus, Flex, Flex Plus, Economy Starter Max or
              Business Max fare with Jetstar.
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

  if (jalResults.length !== 0) {
    infoAlerts.push(
      <Alert severity="info" key="jal-alerts">
        <Typography>
          Japan Airlines flights within Japan are awarded points based on information provided by
          Japan Airlines. Qantas does not define the earning rules for these flights
        </Typography>
      </Alert>
    );
  }

  if (infoAlerts.length === 0) {
    return <></>;
  }
  return <>{infoAlerts}</>;
};

export default function Qantas() {
  const {
    segmentInputs,
    inputErrors,
    eliteStatus,
    tripType,
    compareWithProgramApi: compareWithQantasCalc,
    isCalculating,
    calculationOutput,
    savedCalculations,
    setEliteStatus,
    setTripType,
    setCompareWithProgramApi: setCompareWithQantasCalc,
    addSegment,
    deleteSegment,
    updateSegment,
    reorderSegments,
    setAllSegmentInputs,
    calculate,
    loadRecentCalculation,
    deleteRecentCalculation,
    clearAllRecentCalculations,
  } = useCalculator({ program: qantasProgram });

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          my: 2,
          gap: 1,
        }}
      >
        <Typography variant="h4" component="h1" textAlign="center">
          Qantas Points and Status Credits Calculator
        </Typography>

        <Box mt={3} sx={{ width: "100%" }}>
          <Paper elevation={3}>
            <Box
              p={2}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 0 },
                pb: { xs: 0.5, sm: 2 },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}>
                <ToggleButtonGroup
                  data-testid="trip-type-toggle"
                  color="primary"
                  size="small"
                  value={tripType}
                  exclusive
                  aria-label="Trip type selection"
                  onChange={(_event, value) => {
                    if (value) setTripType(value);
                  }}
                >
                  <ToggleButton
                    data-testid="trip-type-oneway"
                    value="one way"
                    aria-label="One way flight"
                  >
                    One Way
                  </ToggleButton>
                  <ToggleButton
                    data-testid="trip-type-return"
                    value="return"
                    aria-label="Return flight"
                  >
                    Return
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}>
                <EliteStatusInput
                  eliteStatus={eliteStatus}
                  onChange={(value) => setEliteStatus(value)}
                />
              </Box>
            </Box>
            <Box p={2} sx={{ pt: { xs: 0.5, sm: 2 } }}>
              <SegmentInputList
                segmentInputs={segmentInputs}
                errors={inputErrors}
                adapter={qantasProgram.segmentInputAdapter}
                airlineOptions={qantasProgram.airlineOptions}
                onDeleteSegmentPressed={deleteSegment}
                onSegmentInputChanged={updateSegment}
                onSegmentsReordered={reorderSegments}
              />

              <Grid
                container
                columns={{ xs: 8, sm: 12 }}
                spacing={1}
                sx={{
                  mt: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Grid size={{ xs: 4, sm: 4 }}>
                  <Button data-testid="add-segment-button" variant="contained" onClick={addSegment}>
                    Add Segment
                  </Button>
                </Grid>
                <Grid
                  container
                  size={{ xs: 8, sm: 4 }}
                  order={{ xs: 3, sm: 2 }}
                  sx={{
                    justifyContent: "center",
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Button
                    data-testid="calculate-button"
                    variant="contained"
                    size="large"
                    onClick={calculate}
                    loading={isCalculating}
                    sx={{ borderRadius: "28px" }}
                  >
                    Calculate
                  </Button>
                </Grid>
                <Grid size={{ xs: 4, sm: 4 }} order={{ xs: 2, sm: 3 }}>
                  <CompareWithQantasAPISwitch
                    checked={compareWithQantasCalc}
                    onChange={setCompareWithQantasCalc}
                  />
                </Grid>
              </Grid>
            </Box>
            {savedCalculations && savedCalculations.length > 0 && (
              <Box pt={0} pb={2} px={2}>
                <RecentCalculationSelection
                  recentCalculations={savedCalculations}
                  onRecentCalculationClick={loadRecentCalculation}
                  onRecentCalcutionDeleteClick={deleteRecentCalculation}
                  onClearAllClick={clearAllRecentCalculations}
                />
              </Box>
            )}
            <Box pt={0} pb={2} px={2}>
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
        <FaqAndInfo />
        <Box mt={5} sx={{ width: "100%" }}>
          <ChangeLog />
        </Box>
        <Footer />
      </Box>
    </Container>
  );
}
