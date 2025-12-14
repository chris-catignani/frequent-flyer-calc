import { Cancel, CheckCircle, Info } from '@mui/icons-material';
import { Box, Dialog, DialogTitle, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

export const ResultsSummary = ({ calculationOutput, compareWithQantasCalc, isCalculating }) => {
  if (!calculationOutput) {
    return <></>;
  }

  const MatchesQantasErrorDialog = ({ open, onClose, error }) => {
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

  const MatchesQantasMisMatchDialog = ({ open, onClose, field, expectedValue, actualValue }) => {
    const fieldLabel = field === 'airlinePoints' ? 'Qantas Points' : 'Status Credits';
    return (
      <Dialog onClose={onClose} open={open}>
        <DialogTitle>Qantas Calculator results do not match our results</DialogTitle>
        <Grid container direction="column" mx={2} mb={2}>
          <Typography>Our Results:</Typography>
          <Typography>{fieldLabel + ': ' + expectedValue}</Typography>
          <Typography mt={2}>Qantas Calculator Results:</Typography>
          <Typography>{fieldLabel + ': ' + actualValue}</Typography>
          <Typography mt={2}>See the results below to see details by segment</Typography>
        </Grid>
      </Dialog>
    );
  };

  const TotalAirlinePointsEarned = () => {
    return (
      <Grid container justifyContent="center" alignItems="center" spacing={1} direction={'row'}>
        <Typography variant="h5">
          Qantas Points Earned: {calculationOutput?.airlinePoints?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.airlinePoints}
          fieldToCheck={'airlinePoints'}
        />
      </Grid>
    );
  };

  const TotalElitePointsEarned = () => {
    return (
      <Grid container justifyContent="center" alignItems="center" spacing={1} direction={'row'}>
        <Typography variant="h5">
          Status Credits Earned: {calculationOutput?.elitePoints?.toLocaleString()}
        </Typography>
        <MatchesQantasAPIIcon
          expectedValue={calculationOutput?.elitePoints}
          fieldToCheck={'elitePoints'}
        />
      </Grid>
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
        sumOfQantasAPICalc += segmentResult.qantasAPIResults?.qantasData?.[fieldToCheck];
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
    <Box mt={5}>
      <TotalAirlinePointsEarned />
      <TotalElitePointsEarned />
    </Box>
  );
};
