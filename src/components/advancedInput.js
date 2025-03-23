import { SegmentInput } from '@/models/segmentInput';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export const AdvancedInput = ({ setSegmentInputs }) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setOpen(!isOpen)}
        sx={{ cursor: 'pointer' }}
      >
        <Typography>Advanced Input</Typography>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </Stack>
      {isOpen && <AdvancedInputSelection setSegmentInputs={setSegmentInputs} />}
    </Box>
  );
};

const AdvancedInputSelection = ({ setSegmentInputs }) => {
  const [expanded, setExpanded] = useState(false);
  const [inputError, setInputError] = useState({});
  const [itaMatrixJson, setItaMatrixJson] = useState();

  const handleChange = (accordianPanel) => (event, isExpanded) => {
    setExpanded(isExpanded ? accordianPanel : false);
  };

  const applyItaMatrixInput = () => {
    const { segmentInputs, parsingError } = parseItaMatrixInput(itaMatrixJson);

    if (parsingError) {
      setExpanded('ita-matrix');
      setInputError({ 'ita-matrix': parsingError });
    } else {
      setExpanded(false);
      setInputError({});
      setSegmentInputs(segmentInputs);
    }
  };

  console.log(inputError);

  return (
    <Box pt={1}>
      <Accordion expanded={expanded === 'free-form'} onChange={handleChange('free-form')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Free Form Text Itinerary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FreeFormTextItinerary />
        </AccordionDetails>
        <AccordionActions>
          <Button>Apply</Button>
        </AccordionActions>
      </Accordion>
      <Accordion expanded={expanded === 'ita-matrix'} onChange={handleChange('ita-matrix')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>ITA Matrix Itinerary</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pb: 0 }}>
          <ItaMatrixItinerary
            itaMatrixJson={itaMatrixJson}
            itaMatrixJsonChanged={setItaMatrixJson}
            error={inputError['ita-matrix']}
          />
        </AccordionDetails>
        <AccordionActions sx={{ pt: 0 }}>
          <Button onClick={applyItaMatrixInput}>Apply</Button>
        </AccordionActions>
      </Accordion>
    </Box>
  );
};

const FreeFormTextItinerary = () => {
  return (
    <Box>
      <Typography>Coming soon</Typography>
    </Box>
  );
};

const ItaMatrixItinerary = ({ itaMatrixJson, itaMatrixJsonChanged, error }) => {
  return (
    <Stack spacing={2}>
      <Typography>
        Paste the ITA Matrix itinerary below to calculate the Qantas Points and Status Credits.
        <br />
        On the &quot;Itinerary Details&quot; page, in the &quot;Share & Export&quot; section, select
        &quot;Copy itinerary as JSON&quot; and paste the results below. Then click apply followed by
        calculate.
      </Typography>
      <TextField
        fullWidth
        multiline
        maxRows={10}
        label=""
        placeholder="Paste ITA Matrix JSON here"
        value={itaMatrixJson}
        error={error}
        helperText={error ? error : ' '}
        onChange={(event) => itaMatrixJsonChanged(event.target.value)}
      />
    </Stack>
  );
};

const parseItaMatrixInput = (itaMatrixJson) => {
  const segmentInputs = [];

  if (!itaMatrixJson || itaMatrixJson === '') {
    const parsingError = 'ITA Matrix JSON required';
    return { segmentInputs, parsingError };
  }

  let itaMatrixObj = undefined;

  try {
    itaMatrixObj = JSON.parse(itaMatrixJson);
  } catch (err) {
    console.log(err);
    const parsingError = 'Invalid JSON format';
    return { segmentInputs, parsingError };
  }

  if (!itaMatrixObj.itinerary?.slices) {
    const parsingError = 'ITA Matrix JSON missing itinerary, or slices';
    return { segmentInputs, parsingError };
  }

  itaMatrixObj.itinerary.slices.forEach((slice) => {
    slice.segments.forEach((segment) => {
      const airline = segment.carrier.code.toLowerCase();
      const fareClass = segment.bookingInfos[0].bookingCode.toLowerCase();

      segment.legs.forEach((leg) => {
        const fromAirportText = leg.origin.code.toLowerCase();
        const toAirportText = leg.destination.code.toLowerCase();

        segmentInputs.push(new SegmentInput(airline, fareClass, fromAirportText, toAirportText));
      });
    });
  });

  return { segmentInputs, parsingError: undefined };
};
