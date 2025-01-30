import { AIRLINES, EARN_CATEGORY_DISPLAY, EARN_CATEGORY_URLS, QANTAS_FARE_CLASS_DISPLAY } from "@/models/constants";
import { TableRow, TableCell, Grid2, Typography, TableContainer, Table, TableHead, TableBody, IconButton, Dialog, DialogTitle, Alert, Tooltip } from "@mui/material";
import { useState } from "react";
import { Cancel, CheckCircle, Info } from "@mui/icons-material";

export const SegmentResults = ({ calculatedData, compareWithQantasCalc }) => {
  if (!calculatedData) {
    return <></>;
  }

  return (
    <Grid2
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <TableContainer>
        <Table>
          <TableHead>
            <SegmentTableHeader compareWithQantasCalc={compareWithQantasCalc} />
          </TableHead>
          <TableBody>
            {calculatedData.segmentResults.map((segmentResult, segmentIdx) => (
              <SegmentTableRow
                key={segmentIdx}
                segmentResult={segmentResult}
                compareWithQantasCalc={compareWithQantasCalc}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid2>
  );
};

const SegmentTableHeader = ({ compareWithQantasCalc }) => {
  return (
    <TableRow>
      <TableCell>Segment<br/>Route</TableCell>
      <TableCell align="right">Airline</TableCell>
      <TableCell align="right">Qantas Points</TableCell>
      <TableCell align="right">Status<br/>Credits</TableCell>
      <TableCell align="right">Fare Class</TableCell>
      <TableCell align="right">Earning<br/>Category</TableCell>
      <TableCell align="right">Earning Rule</TableCell>
      { compareWithQantasCalc && (
        <TableCell align="right">Matches<br/>Qantas</TableCell>
      )}
    </TableRow>
  );
};

const getFareClassDisplay = (fareClass) => {
  if (fareClass.length === 1) {
    return fareClass;
  } else if (fareClass in QANTAS_FARE_CLASS_DISPLAY) {
    return QANTAS_FARE_CLASS_DISPLAY[fareClass];
  } else {
    return fareClass;
  }
}

const getEarnCategoryDisplay = (airline, earnCategory) => {
  return (
    <a href={EARN_CATEGORY_URLS[airline]} target="_blank">
      {EARN_CATEGORY_DISPLAY[earnCategory]}
    </a>
  );

}

const QantasPointsBreakdownDialog = ({ open, onClose, segmentResult }) => {
  const {
    qantasPointsBreakdown: { basePoints, eliteBonus, minPoints, totalEarned },
  } = segmentResult;
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Points Calculation Breakdown</DialogTitle>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        pb={2}
      >
        <Typography mb={3} sx={{ textDecoration: "underline" }}>
          Total Points: {totalEarned?.toLocaleString()}
        </Typography>
        <Typography lineHeight={1}>
          Base Points: {basePoints?.toLocaleString()}
        </Typography>
        <Typography lineHeight={1}>+</Typography>
        <Typography lineHeight={1}>
          Elite Bonus: {eliteBonus.qantasPoints?.toLocaleString() || "n/a"}
        </Typography>
        <Typography my={2}>- or -</Typography>
        <Typography>
          Min Points: {minPoints?.toLocaleString() || "n/a"}
        </Typography>
      </Grid2>
    </Dialog>
  );
};

const QantasPointsDisplay = ({ segmentResult }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid2 container justifyContent='flex-end'>
      <Typography>{segmentResult.qantasPoints?.toLocaleString()}</Typography>
      <IconButton size="small" sx={{ py: 0 }} onClick={handleClickOpen}>
        <Info />
      </IconButton>
      <QantasPointsBreakdownDialog
        open={open}
        onClose={handleClose}
        segmentResult={segmentResult}
      />
    </Grid2>
  );
}

const RuleDialog = ({ open, onClose, ruleName, ruleUrl, notes }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Calculation notes</DialogTitle>
      <Grid2
        container
        direction="column"
        mx={2}
        mb={2}
      >
        <Typography>Rule used: <a href={ruleUrl} target="_blank">{ruleName}</a></Typography>
        <Typography>Rule specifics: {notes}</Typography>
      </Grid2>
    </Dialog>
  );
};

const RuleDisplay = ({ ruleName, ruleUrl, notes }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid2 container justifyContent="flex-end">
      <a href={ruleUrl} target="_blank">
        {ruleName}
      </a>
      <IconButton size="small" sx={{ py: 0 }} onClick={handleClickOpen}>
        <Info />
      </IconButton>
      <RuleDialog open={open} onClose={handleClose} ruleUrl={ruleUrl} ruleName={ruleName} notes={notes} />
    </Grid2>
  );
};

const MatchesQantasSegmentErrorDialog = ({ open, onClose, error }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator failed to calculate segment</DialogTitle>
      <Grid2 container direction="column" mx={2} mb={2}>
        <Typography>Error returned: {error.message}</Typography>
      </Grid2>
    </Dialog>
  );
};

const MatchesQantasSegmentMisMatchDialog = ({ open, onClose, segmentResult }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator results do not match our results for this segment</DialogTitle>
      <Grid2 container direction="column" mx={2} mb={2}>
        <Typography>Our Results:</Typography>
        <Typography>Qantas Points: {segmentResult.qantasPoints}</Typography>
        <Typography>Status Credits: {segmentResult.statusCredits}</Typography>
        <Typography mt={2}>Qantas Caclculator Results:</Typography>
        <Typography>Qantas Points: {segmentResult.qantasAPIResults?.qantasData?.qantasPoints}</Typography>
        <Typography>Status Credits: {segmentResult.qantasAPIResults?.qantasData?.statusCredits}</Typography>
      </Grid2>
    </Dialog>
  );
};

const MatchesQantasSegment = ({ segmentResult }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!segmentResult.qantasAPIResults) {
    return <></>;
  }

  const qantasAPIError = segmentResult.qantasAPIResults?.error
  const matchesQantasPoints = segmentResult.qantasPoints === segmentResult.qantasAPIResults?.qantasData?.qantasPoints
  const matchesStatusCredits = segmentResult.statusCredits === segmentResult.qantasAPIResults?.qantasData?.statusCredits

  if (qantasAPIError) {
    return (
      <Tooltip title="Qantas Calculator Failed to Calculate">
        <IconButton
          onClick={handleClickOpen}
          sx={{ minHeight: 0, minWidth: 0, padding: 0 }}
        >
          <Info color="warning" />
        </IconButton>
        <MatchesQantasSegmentErrorDialog
          open={open}
          onClose={handleClose}
          error={qantasAPIError}
        />
      </Tooltip>
    );
  } else if (matchesQantasPoints && matchesStatusCredits) {
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
        <IconButton
          onClick={handleClickOpen}
          sx={{ minHeight: 0, minWidth: 0, padding: 0 }}
        >
          <Cancel color="error" />
        </IconButton>
        <MatchesQantasSegmentMisMatchDialog open={open} onClose={handleClose} segmentResult={segmentResult} />
      </Tooltip>
    );
  }
};

const SegmentTableRow = ({ segmentResult, compareWithQantasCalc }) => {
  const { segment, error } = segmentResult;

  if (error) {
    return (
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {segment.fromAirport.iata.toLowerCase()} - {segment.toAirport.iata.toLowerCase()}
        </TableCell>
        <TableCell align="right">{AIRLINES[segment.airline]}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">{segment.fareClass}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        { compareWithQantasCalc && (<TableCell align="right">n/a</TableCell> )}
        <TableCell align="right">
          <Alert severity="error">{error.message}</Alert>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {segment.fromAirport.iata.toLowerCase()} - {segment.toAirport.iata.toLowerCase()}
      </TableCell>
      <TableCell align="right">{AIRLINES[segment.airline]}</TableCell>
      <TableCell align="right">
        <QantasPointsDisplay segmentResult={segmentResult} />
      </TableCell>
      <TableCell align="right">
        {segmentResult.statusCredits?.toLocaleString()}
      </TableCell>
      <TableCell align="right">
        {getFareClassDisplay(segment.fareClass)}
      </TableCell>
      <TableCell align="right">
        {getEarnCategoryDisplay(
          segment.airline,
          segmentResult.fareEarnCategory
        )}
      </TableCell>
      <TableCell align="right">
        <RuleDisplay
          ruleName={segmentResult.ruleName}
          ruleUrl={segmentResult.ruleUrl}
          notes={segmentResult.notes}
        />
      </TableCell>
      {compareWithQantasCalc && (
        <TableCell align="right">
          <MatchesQantasSegment segmentResult={segmentResult} />
        </TableCell>
      )}
    </TableRow>
  );
};
