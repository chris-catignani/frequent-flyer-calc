import { AIRLINES, EARN_CATEGORY_DISPLAY, QANTAS_FARE_CLASS_DISPLAY } from "@/models/constants";
import { TableRow, TableCell, Grid2, Typography, TableContainer, Table, TableHead, TableBody, IconButton, Dialog, DialogTitle, Alert } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

export const Results = ({ calculatedData }) => {
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
            <SegmentTableHeader />
          </TableHead>
          <TableBody>
            {calculatedData.segmentResults.map((segmentResult, segmentIdx) => (
              <SegmentTableRow key={segmentIdx} segmentResult={segmentResult} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid2>
  );
};

const SegmentTableHeader = () => {
  return (
    <TableRow>
      <TableCell>Segment Route</TableCell>
      <TableCell align="right">Airline</TableCell>
      <TableCell align="right">Qantas Points</TableCell>
      <TableCell align="right">Status Credits</TableCell>
      <TableCell align="right">Fare Class</TableCell>
      <TableCell align="right">Earning Category</TableCell>
      <TableCell align="right">Earning Rule</TableCell>
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
        <Typography mb={1} sx={{ textDecoration: "underline" }}>
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
        <InfoIcon />
      </IconButton>
      <QantasPointsBreakdownDialog
        open={open}
        onClose={handleClose}
        segmentResult={segmentResult}
      />
    </Grid2>
  );
}

const RuleDialog = ({ open, onClose, notes }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Calculation notes</DialogTitle>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        m={2}
      >
        <Typography>{notes}</Typography>
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
        <InfoIcon />
      </IconButton>
      <RuleDialog open={open} onClose={handleClose} notes={notes} />
    </Grid2>
  );
};

const SegmentTableRow = ({ segmentResult }) => {
  const { segment, error } = segmentResult;

  if (error) {
    return (
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {segment.fromAirport} - {segment.toAirport}
        </TableCell>
        <TableCell align="right">{AIRLINES[segment.airline]}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">{segment.fareClass}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">
          <Alert severity="error">{error.message}</Alert>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {segment.fromAirport} - {segment.toAirport}
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
        {EARN_CATEGORY_DISPLAY[segmentResult.fareEarnCategory]}
      </TableCell>
      <TableCell align="right">
        <RuleDisplay
          ruleName={segmentResult.ruleName}
          ruleUrl={segmentResult.ruleUrl}
          notes={segmentResult.notes}
        />
      </TableCell>
    </TableRow>
  );
};
