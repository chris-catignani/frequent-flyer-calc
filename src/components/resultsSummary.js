import { Cancel, CheckCircle, Info } from "@mui/icons-material";
import { Box, Grid2, IconButton, Tooltip, Typography } from "@mui/material";

export const ResultsSummary = ({ calculationOutput, compareWithQantasCalc, isCalculating }) => {

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
        <Tooltip title="Qantas Calculator failed to calculate a result">
          <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
            <Info color="warning" />
          </IconButton>
        </Tooltip>
      );
    } else if (expectedValue === sumOfQantasAPICalc) {
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
  };

  return (
    <Box mt={5}>
      <TotalQantasPointsEarned />
      <TotalStatusCreditsEarned />
    </Box>
  );
};
