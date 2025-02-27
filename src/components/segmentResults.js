import { AIRLINES, EARN_CATEGORY_DISPLAY, EARN_CATEGORY_URLS, QANTAS_FARE_CLASS_DISPLAY } from "@/models/constants";
import { TableRow, TableCell, Grid2, Typography, TableContainer, Table, TableHead, TableBody, IconButton, Dialog, DialogTitle, Alert, Tooltip, Collapse } from "@mui/material";
import { useState } from "react";
import { Cancel, CheckCircle, Info, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

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
      width="100%"
      maxWidth="sm"
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
      <TableCell />
      <TableCell>Segment Route</TableCell>
      <TableCell align="right">Qantas Points</TableCell>
      <TableCell align="right">Status Credits</TableCell>
      { compareWithQantasCalc && (
        <TableCell align="right">Matches Qantas</TableCell>
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

const MatchesQantasSegmentErrorDialog = ({ open, onClose, error }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator failed to calculate segment</DialogTitle>
      <Grid2 container direction="column" mx={2} mb={2}>
        <Typography>{error.message}</Typography>
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
        <Typography mt={2}>Qantas Calculator Results:</Typography>
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

  const [open, setOpen] = useState(false);

  if (error) {
    const errorColSpan = compareWithQantasCalc ? 3 : 2
    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell component="th" scope="row">
          {segment.fromAirport.iata.toLowerCase()} - {segment.toAirport.iata.toLowerCase()}
        </TableCell>
        <TableCell align="right" colSpan={errorColSpan}>
          <Alert severity="error">{error.message}</Alert>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <TableRow onClick={() => setOpen(!open)} sx={{cursor: "pointer"}}>
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {segment.fromAirport.iata.toLowerCase()} -{" "}
          {segment.toAirport.iata.toLowerCase()}
        </TableCell>
        <TableCell align="right">
          {segmentResult.qantasPoints?.toLocaleString()}
        </TableCell>
        <TableCell align="right">
          {segmentResult.statusCredits?.toLocaleString()}
        </TableCell>
        {compareWithQantasCalc && (
          <TableCell align="right">
            <MatchesQantasSegment segmentResult={segmentResult} />
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={compareWithQantasCalc ? 5 : 4}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid2 container m={2} direction="column">
              <Grid2>
                <Typography>Airline: {AIRLINES[segment.airline]}</Typography>
              </Grid2>
              <Grid2>
                <Typography>
                  Fare Class: {getFareClassDisplay(segment.fareClass)}
                </Typography>
              </Grid2>
              <Grid2 container direction="row" spacing={1}>
                <Typography>Qantas Points:</Typography>
                <QantasPointsDisplay segmentResult={segmentResult} />
              </Grid2>
              <Grid2>
                <Typography>
                  Status Credits:{" "}
                  {segmentResult.statusCredits?.toLocaleString()}
                </Typography>
              </Grid2>
              <Grid2 container direction="row" spacing={1}>
                <Typography>Earn Category:</Typography>
                <Typography>
                  <a href={EARN_CATEGORY_URLS[segment.airline]} target="_blank">
                    {EARN_CATEGORY_DISPLAY[segmentResult.fareEarnCategory]}
                  </a>
                </Typography>
              </Grid2>
              <Grid2 container direction="row" spacing={1}>
                <Typography>Earning Table:</Typography>
                <Typography>
                  <a href={segmentResult.ruleUrl} target="_blank">
                    {segmentResult.ruleName}
                  </a>
                </Typography>
              </Grid2>
              <Grid2>
                <Typography>
                  Calculation Notes: {segmentResult.notes}
                </Typography>
              </Grid2>
            </Grid2>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
