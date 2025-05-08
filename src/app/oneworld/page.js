'use client';

import { parseEncodedTextItin } from '@/app/_shared/utils/segmentInputParser';
import { Button, Grid2, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ProgramComparison } from './_components/programComparison';
import { Calculator } from '../_shared/calculators/calculator';
import { getAirport } from '../_shared/utils/airports';
import { Route } from '../_shared/models/route';
import { SegmentInput } from '../_shared/models/segmentInput';
import { getEliteTierLevel, getEliteTiersForProgram } from './_models/eliteTiers';

const calculator = new Calculator();

const AddRoute = ({ onAddRoute }) => {
  const [route, setRoute] = useState('');

  const addRoute = () => {
    // TODO handle errors
    // eslint-disable-next-line
    const { segmentInputs, parsingError } = parseEncodedTextItin(route, ',', ' ');

    // populate the Airport objects
    segmentInputs.forEach((segmentInput) => {
      segmentInput.fromAirport = getAirport(segmentInput.fromAirportText);
      segmentInput.toAirport = getAirport(segmentInput.toAirportText);
    });

    onAddRoute(new Route(segmentInputs));
    setRoute('');
  };

  return (
    <Grid2 container>
      <TextField value={route} onChange={(event) => setRoute(event.target.value)} />
      <Button onClick={addRoute}>Add Route</Button>
    </Grid2>
  );
};

export default function Oneworld() {
  const [programs, setPrograms] = useState([]);
  const [eliteTiers, setEliteTiers] = useState({});
  const [routes, setRoutes] = useState([]);
  const [results, setResults] = useState({});

  // TODO temporarily seed test data
  useEffect(() => {
    setPrograms(['malaysia', 'qantas']);
    setEliteTiers({
      malaysia: getEliteTiersForProgram('malaysia'),
      qantas: getEliteTiersForProgram('qantas'),
    });

    const segmentInputs = [
      new SegmentInput('aa', 'i', 'jfk', 'lhr'),
      new SegmentInput('ay', 'i', 'lhr', 'hel'),
      new SegmentInput('ay', 'i', 'hel', 'agp'),
    ];
    segmentInputs.forEach((segmentInput) => {
      segmentInput.fromAirport = getAirport(segmentInput.fromAirportText);
      segmentInput.toAirport = getAirport(segmentInput.toAirportText);
    });

    setRoutes([new Route([segmentInputs[0]]), new Route([segmentInputs[1], segmentInputs[2]])]);
  }, [setPrograms, setEliteTiers, setRoutes]);

  const onEliteTierChange = (program, eliteTier, include) => {
    const programEliteTiers = [...eliteTiers[program]];

    const eliteTierIdx = programEliteTiers.indexOf(eliteTier);
    if (include) {
      if (eliteTierIdx === -1) {
        programEliteTiers.splice(getEliteTierLevel(program, eliteTier), 0, eliteTier);
      }
    } else {
      if (eliteTierIdx !== -1) {
        programEliteTiers.splice(eliteTierIdx, 1);
      }
    }

    setEliteTiers({ ...eliteTiers, [program]: programEliteTiers });
  };

  const onAddRouteClicked = (route) => {
    setRoutes([...routes, route]);
  };

  const onCalculateClicked = async () => {
    const newResults = {};

    for (const route of routes) {
      newResults[route.uuid] = {};

      for (const program of programs) {
        newResults[route.uuid][program] = {};
        for (const eliteTier of eliteTiers[program]) {
          const calcResults = await calculator.calculate(program, route.segmentInputs, eliteTier);
          newResults[route.uuid][program][eliteTier] = calcResults;
        }
      }
    }

    console.log(newResults);

    setResults(newResults);
  };

  return (
    <>
      <ProgramComparison
        routes={routes}
        programs={programs}
        eliteTiers={eliteTiers}
        onEliteTierChange={onEliteTierChange}
        results={results}
      />
      <AddRoute onAddRoute={onAddRouteClicked} />
      <Button onClick={onCalculateClicked}>Calculate</Button>
    </>
  );
}
