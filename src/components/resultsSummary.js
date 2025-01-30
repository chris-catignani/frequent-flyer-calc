import { Cancel, CheckCircle, Info } from "@mui/icons-material";
import { Box, Dialog, DialogTitle, Grid2, IconButton, Typography } from "@mui/material";
import { useState } from "react";

export const ResultsSummary = ({ calculationOutput, compareWithQantasCalc, isCalculating }) => {

  const MatchesQantasErrorDialog = ({ open, onClose, error }) => {
    return (
      <Dialog onClose={onClose} open={open}>
        <DialogTitle>Qantas Calculator failed to calculate at least one segment</DialogTitle>
        <Grid2 container direction="column" mx={2} mb={2}>
          <Typography>{error.message}</Typography>
          <Typography mt={2}>Expand the results below to see details by segment</Typography>
        </Grid2>
      </Dialog>
    );
  };

  const MatchesQantasMisMatchDialog = ({ open, onClose, field, expectedValue, actualValue }) => {
    const fieldLabel = field === 'qantasPoints' ? "Qantas Points" : "Status Credits"
    return (
      <Dialog onClose={onClose} open={open}>
        <DialogTitle>
          Qantas Calculator results do not match our results
        </DialogTitle>
        <Grid2 container direction="column" mx={2} mb={2}>
          <Typography>Our Results:</Typography>
          <Typography>{fieldLabel + ": " + expectedValue}</Typography>
          <Typography mt={2}>Qantas Calculator Results:</Typography>
          <Typography>{fieldLabel + ": " + actualValue}</Typography>
          <Typography mt={2}>Expand the results below to see details by segment</Typography>
        </Grid2>
      </Dialog>
    );
  };

  const TotalQantasPointsEarned = () => {
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

  const TotalStatusCreditsEarned = () => {
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

  const MatchesQantasAPIIcon = ({ expectedValue, fieldToCheck }) => {
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
    let qantasAPICalcError = null;
    calculationOutput.segmentResults.forEach((segmentResult) => {
      if (segmentResult.qantasAPIResults?.error) {
        qantasAPICalcError = segmentResult.qantasAPIResults?.error;
      } else {
        sumOfQantasAPICalc +=
          segmentResult.qantasAPIResults?.qantasData?.[fieldToCheck];
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
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <CheckCircle color="success" />
          </IconButton>
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
    <Box mt={5}>
      <TotalQantasPointsEarned />
      <TotalStatusCreditsEarned />
    </Box>
  );
};
