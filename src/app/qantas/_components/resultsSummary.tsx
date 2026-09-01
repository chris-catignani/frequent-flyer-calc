import React, { useState } from "react";
import { Cancel, CheckCircle, Info } from "@mui/icons-material";
import { Box, Dialog, DialogTitle, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import type { CalculationResult } from "@/types/calculator";

export interface ResultsSummaryProps {
  calculationOutput?: CalculationResult | null;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  if (!calculationOutput) {
    return <></>;
  }

  const MatchesQantasErrorDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    error: Error | { message?: string };
  }> = ({ open, onClose, error }) => {
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

  const MatchesQantasMisMatchDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    field: "airlinePoints" | "elitePoints";
    expectedValue?: number;
    actualValue?: number;
  }> = ({ open, onClose, field, expectedValue, actualValue }) => {
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

  const TotalAirlinePointsEarned: React.FC = () => {
    return (
      <Grid container justifyContent="center" alignItems="center" spacing={1} direction={"row"}>
        <Typography variant="h5" data-testid="total-points-earned">
          Qantas Points Earned: {calculationOutput?.airlinePoints?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.airlinePoints}
          fieldToCheck={"airlinePoints"}
        />
      </Grid>
    );
  };

  const TotalElitePointsEarned: React.FC = () => {
    return (
      <Grid container justifyContent="center" alignItems="center" spacing={1} direction={"row"}>
        <Typography variant="h5" data-testid="total-status-credits-earned">
          Status Credits Earned: {calculationOutput?.elitePoints?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.elitePoints}
          fieldToCheck={"elitePoints"}
        />
      </Grid>
    );
  };

  const MatchesQantasAPIIcon: React.FC<{
    expectedValue?: number;
    fieldToCheck: "airlinePoints" | "elitePoints";
  }> = ({ expectedValue, fieldToCheck }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    if (!compareWithQantasCalc || !calculationOutput || isCalculating) {
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

    if (qantasAPICalcError) {
      return (
        <Box>
          <IconButton onClick={handleClickOpen} sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <Info color="warning" />
          </IconButton>
          <MatchesQantasErrorDialog open={open} onClose={handleClose} error={qantasAPICalcError} />
        </Box>
      );
    } else if (expectedValue === sumOfQantasAPICalc) {
      return (
        <Box>
          <Tooltip title="Matches Qantas Calculator results">
            <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
              <CheckCircle color="success" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else {
      return (
        <Box>
          <IconButton onClick={handleClickOpen} sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
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

  return (
    <Box mt={5} data-testid="results-summary">
      <TotalAirlinePointsEarned />
      <TotalElitePointsEarned />
    </Box>
  );
};
