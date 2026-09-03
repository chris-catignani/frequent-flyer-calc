import React, { useState } from "react";
import { Cancel, CheckCircle, Info } from "@mui/icons-material";
import { Box, Dialog, DialogTitle, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import type { CalculationResult } from "@/types/calculator";
import {
  isAirlinePointsMatch,
  isClosePointsMatch,
  isElitePointsMatch,
  POINTS_TOLERANCE_PER_SEGMENT,
} from "@/utils/comparison";

export interface ResultsSummaryProps {
  calculationOutput?: CalculationResult | null;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
}

interface MatchesQantasErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: Error | { message?: string };
}

const MatchesQantasErrorDialog: React.FC<MatchesQantasErrorDialogProps> = ({
  open,
  onClose,
  error,
}) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator failed to calculate at least one segment</DialogTitle>
      <Grid container direction="column" mx={2} mb={2}>
        <Typography>{error.message}</Typography>
        <Typography mt={2}>See the results below to see details by segment</Typography>
      </Grid>
    </Dialog>
  );
};

interface MatchesQantasMisMatchDialogProps {
  open: boolean;
  onClose: () => void;
  field: "airlinePoints" | "elitePoints";
  expectedValue?: number;
  actualValue?: number;
}

const MatchesQantasMisMatchDialog: React.FC<MatchesQantasMisMatchDialogProps> = ({
  open,
  onClose,
  field,
  expectedValue,
  actualValue,
}) => {
  const fieldLabel = field === "airlinePoints" ? "Qantas Points" : "Status Credits";
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator results do not match our results</DialogTitle>
      <Grid container direction="column" mx={2} mb={2}>
        <Typography>Our Results:</Typography>
        <Typography>{fieldLabel + ": " + expectedValue}</Typography>
        <Typography mt={2}>Qantas Calculator Results:</Typography>
        <Typography>{fieldLabel + ": " + actualValue}</Typography>
        <Typography mt={2}>See the results below to see details by segment</Typography>
      </Grid>
    </Dialog>
  );
};

interface MatchesQantasAPIIconProps {
  calculationOutput: CalculationResult;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
  expectedValue?: number;
  fieldToCheck: "airlinePoints" | "elitePoints";
}

const MatchesQantasAPIIcon: React.FC<MatchesQantasAPIIconProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
  expectedValue,
  fieldToCheck,
}) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!compareWithQantasCalc || isCalculating) {
    return <></>;
  }

  let sumOfQantasAPICalc = 0;
  let qantasAPICalcError: Error | { message?: string } | null = null;
  calculationOutput.segmentResults.forEach((segmentResult) => {
    if (segmentResult.qantasAPIResults?.error) {
      qantasAPICalcError = segmentResult.qantasAPIResults.error as Error;
    } else {
      sumOfQantasAPICalc +=
        (segmentResult.qantasAPIResults?.qantasData?.[fieldToCheck] as number) || 0;
    }
  });

  const numSegments = calculationOutput.segmentResults.length;
  const allowedTolerance =
    fieldToCheck === "airlinePoints" ? numSegments * POINTS_TOLERANCE_PER_SEGMENT : 0;

  const isMatch =
    fieldToCheck === "airlinePoints"
      ? isAirlinePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc, allowedTolerance)
      : isElitePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc);

  const isCloseMatch =
    isMatch &&
    fieldToCheck === "airlinePoints" &&
    isClosePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc, allowedTolerance);

  const matchTooltip = isCloseMatch
    ? "Matches Qantas Calculator results (within rounding difference)"
    : "Matches Qantas Calculator results";

  if (qantasAPICalcError) {
    return (
      <Box>
        <IconButton
          onClick={handleClickOpen}
          sx={{ minHeight: 0, minWidth: 0, padding: 0 }}
          aria-label="View Qantas API calculation error details"
        >
          <Info color="warning" />
        </IconButton>
        <MatchesQantasErrorDialog open={open} onClose={handleClose} error={qantasAPICalcError} />
      </Box>
    );
  } else if (isMatch) {
    return (
      <Box>
        <Tooltip title={matchTooltip}>
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }} aria-label={matchTooltip}>
            <CheckCircle color="success" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  } else {
    return (
      <Box>
        <IconButton
          onClick={handleClickOpen}
          sx={{ minHeight: 0, minWidth: 0, padding: 0 }}
          aria-label="View Qantas API calculation mismatch details"
        >
          <Cancel color="error" />
        </IconButton>
        <MatchesQantasMisMatchDialog
          open={open}
          onClose={handleClose}
          field={fieldToCheck}
          expectedValue={expectedValue}
          actualValue={sumOfQantasAPICalc}
        />
      </Box>
    );
  }
};

interface TotalPointsEarnedProps {
  calculationOutput: CalculationResult;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
}

const TotalAirlinePointsEarned: React.FC<TotalPointsEarnedProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  return (
    <Grid container justifyContent="center" alignItems="center" spacing={1} direction={"row"}>
      <Typography variant="h5" data-testid="total-points-earned">
        Qantas Points Earned: {calculationOutput.airlinePoints?.toLocaleString()}
      </Typography>
      <MatchesQantasAPIIcon
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
        expectedValue={calculationOutput.airlinePoints}
        fieldToCheck={"airlinePoints"}
      />
    </Grid>
  );
};

const TotalElitePointsEarned: React.FC<TotalPointsEarnedProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  return (
    <Grid container justifyContent="center" alignItems="center" spacing={1} direction={"row"}>
      <Typography variant="h5" data-testid="total-status-credits-earned">
        Status Credits Earned: {calculationOutput.elitePoints?.toLocaleString()}
      </Typography>
      <MatchesQantasAPIIcon
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
        expectedValue={calculationOutput.elitePoints}
        fieldToCheck={"elitePoints"}
      />
    </Grid>
  );
};

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  if (!calculationOutput) {
    return <></>;
  }

  return (
    <Box mt={5} data-testid="results-summary">
      <TotalAirlinePointsEarned
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
      />
      <TotalElitePointsEarned
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
      />
    </Box>
  );
};
