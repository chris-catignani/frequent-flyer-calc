import { TableRow, TableCell, Grid2, Box, Typography, TableContainer, Table, TableHead, TableBody } from "@mui/material";

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
      mt={5}
    >
      <Box>
        <Typography variant="h4">Results:</Typography>
        <Box>Qantas Points: {calculatedData.qantasPoints}</Box>
        <Box>Status Credits: {calculatedData.statusCredits}</Box>
      </Box>
      <Box mt={5}>Calculation per segment:</Box>
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
      <TableCell align="right">Rule notes</TableCell>
    </TableRow>
  );
};

const SegmentTableRow = ({ segmentResult }) => {
  const { segment, calculation, error } = segmentResult;

  if (error) {
    return (
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell component="th" scope="row">
          {segment.fromAirport} - {segment.toAirport}
        </TableCell>
        <TableCell align="right">{segment.airline}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">{segment.fareClass}</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">n/a</TableCell>
        <TableCell align="right">{error.message}</TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {segment.fromAirport} - {segment.toAirport}
      </TableCell>
      <TableCell align="right">{segment.airline}</TableCell>
      <TableCell align="right">{calculation.qantasPoints}</TableCell>
      <TableCell align="right">{calculation.statusCredits}</TableCell>
      <TableCell align="right">{segment.fareClass}</TableCell>
      <TableCell align="right">{calculation.fareEarnCategory}</TableCell>
      <TableCell align="right">
        <a href={calculation.ruleUrl} target="_blank">
          {calculation.rule}
        </a>
      </TableCell>
      <TableCell align="right">{calculation.notes}</TableCell>
    </TableRow>
  );
};
