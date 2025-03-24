import { parseEncodedTextItin, parseItaMatrixInput } from '@/utils/segmentInputParser';
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
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setOpen(!isOpen)}
        sx={{ cursor: 'pointer' }}
      >
        <Typography pl={{ xs: 2, sm: 0 }}>Advanced Input</Typography>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </Stack>
      {isOpen && <AdvancedInputSelection setSegmentInputs={setSegmentInputs} />}
    </Stack>
  );
};

const AdvancedInputSelection = ({ setSegmentInputs }) => {
  const [expanded, setExpanded] = useState(false);
  const [inputError, setInputError] = useState({});
  const [textItin, setTextItin] = useState();
  const [itaMatrixJson, setItaMatrixJson] = useState();

  const handleAccordianChange = (accordianPanel) => (event, isExpanded) => {
    setExpanded(isExpanded ? accordianPanel : false);
  };

  const applyTextItinInput = () => {
    const { segmentInputs, parsingError } = parseEncodedTextItin(textItin, '\n', ' ');

    if (parsingError) {
      setExpanded('text-itin');
      setInputError({ 'text-itin': parsingError });
    } else {
      setExpanded(false);
      setInputError({});
      setSegmentInputs(segmentInputs);
    }
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

  return (
    <Box>
      <Accordion expanded={expanded === 'text-itin'} onChange={handleAccordianChange('text-itin')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Free Form Text Itinerary</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pb: 0 }}>
          <FreeFormTextItinerary
            textItin={textItin}
            textItinChanged={setTextItin}
            error={inputError['text-itin']}
          />
        </AccordionDetails>
        <AccordionActions sx={{ pt: 0 }}>
          <Button onClick={applyTextItinInput}>Apply</Button>
        </AccordionActions>
      </Accordion>
      <Accordion
        expanded={expanded === 'ita-matrix'}
        onChange={handleAccordianChange('ita-matrix')}
      >
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

const FreeFormTextItinerary = ({ textItin, textItinChanged, error }) => {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography>Type out an itinerary below, the format rules are:</Typography>
        <ul style={{ margin: 0 }}>
          <li>
            <Typography>Each segment of the itinerary should be on it&apos;s on line</Typography>
          </li>
          <li>
            <Typography>
              Format a segment as: &lt;airline iata&gt; &lt;from airport iata&gt; &lt;to airport
              iata&gt; &lt;fare class letter&gt;
            </Typography>
            <ul>
              <li>
                <Typography>For example: qf syd mel i</Typography>
              </li>
            </ul>
          </li>
        </ul>
      </Box>
      <TextField
        fullWidth
        multiline
        maxRows={10}
        label=""
        placeholder="Text Itinerary here"
        value={textItin}
        error={error}
        helperText={error ? error : ' '}
        onChange={(event) => textItinChanged(event.target.value)}
      />
    </Stack>
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
