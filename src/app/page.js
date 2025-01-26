"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';
import { Autocomplete, Box, Button, Container, Grid2, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { RouteInput } from '@/components/input';
import AddIcon from '@mui/icons-material/Add';
import { Remove } from '@mui/icons-material';

export default function Home() {

  const [segments, setSegments] = useState([new Segment('', '', '', '')])
  const [calculationOutput, setCalculationOutput] = useState();

  const calculatePressed = () => {
    setCalculationOutput(calculate(segments))
  }

  const addSegmentPressed = () => {
    setSegments([
      ...segments,
      new Segment('', '', '', '')
    ])
  }

  const removeSegmentPressed = (segmentIdx) => {
    const newSegments = [...segments]
    newSegments.splice(segmentIdx, 1);
    setSegments(newSegments)
  }

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
  }

  const SegmentTableRow = ({segmentResult}) => {
    const {segment, calculation, error} = segmentResult

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
  }

  const Results = ({calculatedData}) => {
    if (!calculatedData) {
      return <></>
    }

    return (
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box mt={2}>
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
              {calculatedData.segmentResults.map(
                (segmentResult, segmentIdx) => (
                  <SegmentTableRow
                    key={segmentIdx}
                    segmentResult={segmentResult}
                  />
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid2>
    );
  }

  return (
    <Container>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        {segments.map((segment, segmentIdx) => {
          const iconToAdd =
            segmentIdx === segments.length - 1 ? (
              <IconButton onClick={addSegmentPressed}>
                <AddIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => removeSegmentPressed(segmentIdx)}>
                <Remove />
              </IconButton>
            );
          return (
            <Grid2 container key={segmentIdx}>
              <RouteInput
                segment={segment}
                onChange={(segment) => {
                  const newSegments = [...segments];
                  newSegments[segmentIdx] = segment;
                  setSegments(newSegments);

                  // if input changes, ensure calculated data is voided
                  setCalculationOutput(null);
                }}
              />
              {iconToAdd}
            </Grid2>
          );
        })}
      </Stack>
      <Grid2
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        mt={5}
      >
        <Button variant="contained" onClick={calculatePressed}>
          Calculate
        </Button>
      </Grid2>
      <Results calculatedData={calculationOutput} />
    </Container>
  );
}
