import React, { useState } from "react";
import {
  EARN_CATEGORY_DISPLAY,
  EARN_CATEGORY_URLS,
  QANTAS_FARE_CLASS_DISPLAY,
} from "@/app/_shared/models/qantasConstants";
import {
  TableRow,
  TableCell,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  Alert,
  Tooltip,
  Collapse,
} from "@mui/material";
import { Cancel, CheckCircle, Info, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { ALL_AIRLINES } from "@/app/_shared/models/constants";
import type { CalculationResult, SegmentResult } from "@/types/calculator";

export interface SegmentResultsProps {
  calculatedData?: CalculationResult | null;
  compareWithQantasCalc: boolean;
}

export const SegmentResults: React.FC<SegmentResultsProps> = ({
  calculatedData,
  compareWithQantasCalc,
}) => {
  if (!calculatedData) {
    return <></>;
  }

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      maxWidth="sm"
    >
      <TableContainer data-testid="segment-results-table">
        <Table>
          <TableHead>
            <SegmentTableHeader compareWithQantasCalc={compareWithQantasCalc} />
          </TableHead>
          <TableBody>
            {calculatedData.segmentResults.map((segmentResult, segmentIdx) => (
              <SegmentTableRow
                key={segmentIdx}
                segmentIdx={segmentIdx}
                segmentResult={segmentResult}
                compareWithQantasCalc={compareWithQantasCalc}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

const SegmentTableHeader: React.FC<{ compareWithQantasCalc: boolean }> = ({
  compareWithQantasCalc,
}) => {
  return (
    <TableRow>
      <TableCell>Segment Route</TableCell>
      <TableCell align="right">Qantas Points</TableCell>
      <TableCell align="right">Status Credits</TableCell>
      {compareWithQantasCalc && <TableCell align="right">Matches Qantas</TableCell>}
      <TableCell />
    </TableRow>
  );
};

const getFareClassDisplay = (fareClass: string): string => {
  if (fareClass.length === 1) {
    return fareClass;
  } else if (fareClass in QANTAS_FARE_CLASS_DISPLAY) {
    return QANTAS_FARE_CLASS_DISPLAY[fareClass];
  } else {
    return fareClass;
  }
};

const AirlinePointsBreakdownDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  segmentResult: SegmentResult;
}> = ({ open, onClose, segmentResult }) => {
  const { airlinePointsBreakdown: { basePoints, eliteBonus, minPoints, totalEarned } = {} } =
    segmentResult;
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Points Calculation Breakdown</DialogTitle>
      <Grid container direction="column" justifyContent="center" alignItems="center" pb={2}>
        <Typography mb={3} sx={{ textDecoration: "underline" }}>
          Total Points: {totalEarned?.toLocaleString()}
        </Typography>
        <Typography lineHeight={1}>Base Points: {basePoints?.toLocaleString()}</Typography>
        <Typography lineHeight={1}>+</Typography>
        <Typography lineHeight={1}>
          Elite Bonus: {eliteBonus?.airlinePoints?.toLocaleString() || "n/a"}
        </Typography>
        <Typography my={2}>- or -</Typography>
        <Typography>Min Points: {minPoints?.toLocaleString() || "n/a"}</Typography>
      </Grid>
    </Dialog>
  );
};

const AirlinePointsDisplay: React.FC<{ segmentResult: SegmentResult }> = ({ segmentResult }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid container justifyContent="flex-end">
      <Typography>{segmentResult.airlinePoints?.toLocaleString()}</Typography>
      <IconButton size="small" sx={{ py: 0 }} onClick={handleClickOpen}>
        <Info />
      </IconButton>
      <AirlinePointsBreakdownDialog
        open={open}
        onClose={handleClose}
        segmentResult={segmentResult}
      />
    </Grid>
  );
};

const MatchesQantasSegmentErrorDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  error: Error | { message?: string };
}> = ({ open, onClose, error }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator failed to calculate segment</DialogTitle>
      <Grid container direction="column" mx={2} mb={2}>
        <Typography>{error.message}</Typography>
      </Grid>
    </Dialog>
  );
};

const MatchesQantasSegmentMisMatchDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  segmentResult: SegmentResult;
}> = ({ open, onClose, segmentResult }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Qantas Calculator results do not match our results for this segment</DialogTitle>
      <Grid container direction="column" mx={2} mb={2}>
        <Typography>Our Results:</Typography>
        <Typography>Qantas Points: {segmentResult.airlinePoints}</Typography>
        <Typography>Status Credits: {segmentResult.elitePoints}</Typography>
        <Typography mt={2}>Qantas Calculator Results:</Typography>
        <Typography>
          Qantas Points: {segmentResult.qantasAPIResults?.qantasData?.airlinePoints}
        </Typography>
        <Typography>
          Status Credits: {segmentResult.qantasAPIResults?.qantasData?.elitePoints}
        </Typography>
      </Grid>
    </Dialog>
  );
};

const MatchesQantasSegmentIcon: React.FC<{
  segmentResult: SegmentResult;
  qantasAPIError?: Error | { message?: string } | null;
  matchesAirlinePoints: boolean;
  matchesElitePoints: boolean;
}> = ({ segmentResult, qantasAPIError, matchesAirlinePoints, matchesElitePoints }) => {
  if (!segmentResult.qantasAPIResults) {
    return <></>;
  }

  if (qantasAPIError) {
    return (
      <Tooltip title="Qantas Calculator Failed to Calculate">
        <IconButton sx={{ minHeight: 0, minWidth: 0, padding: 0 }}>
          <Info color="warning" />
        </IconButton>
      </Tooltip>
    );
  } else if (matchesAirlinePoints && matchesElitePoints) {
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

const SegmentTableRow: React.FC<{
  segmentIdx: number;
  segmentResult: SegmentResult;
  compareWithQantasCalc: boolean;
}> = ({ segmentIdx, segmentResult, compareWithQantasCalc }) => {
  const { segment, error } = segmentResult;

  const [expandRow, setExpandRow] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  if (error) {
    const errorColSpan = compareWithQantasCalc ? 4 : 3;
    const errorMsg = error instanceof Error ? error.message : String(error);
    return (
      <TableRow data-testid={`segment-result-row-${segmentIdx}`}>
        <TableCell component="th" scope="row" data-testid={`segment-result-route-${segmentIdx}`}>
          {segment.fromAirport?.iata?.toLowerCase()} - {segment.toAirport?.iata?.toLowerCase()}
        </TableCell>
        <TableCell align="right" colSpan={errorColSpan}>
          <Alert severity="error">{errorMsg}</Alert>
        </TableCell>
      </TableRow>
    );
  }

  const qantasAPIError = segmentResult.qantasAPIResults?.error;
  const matchesAirlinePoints =
    segmentResult.airlinePoints === segmentResult.qantasAPIResults?.qantasData?.airlinePoints;
  const matchesElitePoints =
    segmentResult.elitePoints === segmentResult.qantasAPIResults?.qantasData?.elitePoints;

  return (
    <>
      <TableRow sx={{ cursor: "pointer" }} data-testid={`segment-result-row-${segmentIdx}`}>
        <TableCell
          component="th"
          scope="row"
          data-testid={`segment-result-route-${segmentIdx}`}
          onClick={() => setExpandRow(!expandRow)}
        >
          {segment.fromAirport?.iata?.toLowerCase()} - {segment.toAirport?.iata?.toLowerCase()}
        </TableCell>
        <TableCell
          align="right"
          data-testid={`segment-result-points-${segmentIdx}`}
          onClick={() => setExpandRow(!expandRow)}
        >
          {segmentResult.airlinePoints?.toLocaleString()}
        </TableCell>
        <TableCell
          align="right"
          data-testid={`segment-result-status-credits-${segmentIdx}`}
          onClick={() => setExpandRow(!expandRow)}
        >
          {segmentResult.elitePoints?.toLocaleString()}
        </TableCell>
        {compareWithQantasCalc && (
          <TableCell
            align="right"
            onClick={() => {
              if (matchesAirlinePoints && matchesElitePoints) {
                setExpandRow(!expandRow);
              } else {
                setOpenModal(true);
              }
            }}
          >
            <MatchesQantasSegmentIcon
              segmentResult={segmentResult}
              qantasAPIError={qantasAPIError}
              matchesAirlinePoints={matchesAirlinePoints}
              matchesElitePoints={matchesElitePoints}
            />
          </TableCell>
        )}
        <TableCell onClick={() => setExpandRow(!expandRow)}>
          <IconButton size="small">
            {expandRow ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={compareWithQantasCalc ? 5 : 4}
        >
          <Collapse in={expandRow} timeout="auto" unmountOnExit>
            <Grid container m={2} direction="column">
              <Grid>
                <Typography>Airline: {ALL_AIRLINES[segment.airline]}</Typography>
              </Grid>
              <Grid>
                <Typography>Fare Class: {getFareClassDisplay(segment.fareClass)}</Typography>
              </Grid>
              <Grid container direction="row" spacing={1}>
                <Typography>Qantas Points:</Typography>
                <AirlinePointsDisplay segmentResult={segmentResult} />
              </Grid>
              <Grid>
                <Typography>
                  Status Credits: {segmentResult.elitePoints?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid container direction="row" spacing={1}>
                <Typography>Earn Category:</Typography>
                <Typography>
                  <a href={EARN_CATEGORY_URLS[segment.airline]} target="_blank" rel="noreferrer">
                    {EARN_CATEGORY_DISPLAY[segmentResult.fareEarnCategory || ""]}
                  </a>
                </Typography>
              </Grid>
              <Grid container direction="row" spacing={1}>
                <Typography>Earning Table:</Typography>
                <Typography>
                  <a href={segmentResult.ruleUrl} target="_blank" rel="noreferrer">
                    {segmentResult.ruleName}
                  </a>
                </Typography>
              </Grid>
              <Grid>
                <Typography>Calculation Notes: {segmentResult.notes}</Typography>
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
      {qantasAPIError && (
        <MatchesQantasSegmentErrorDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          error={qantasAPIError}
        />
      )}
      {!qantasAPIError && (!matchesAirlinePoints || !matchesElitePoints) && (
        <MatchesQantasSegmentMisMatchDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          segmentResult={segmentResult}
        />
      )}
    </>
  );
};
