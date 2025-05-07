'use client';

import { parseEncodedTextItin } from '@/app/_shared/utils/segmentInputParser';
import { Button, Grid2, TextField } from '@mui/material';
import { useState } from 'react';
import { ProgramComparison } from './_components/programComparison';
import { Calculator } from '../_shared/calculators/calculator';
import { getAirport } from '../_shared/utils/airports';
import { Route } from '../_shared/models/route';

const calculator = new Calculator();

const AddRoute = ({ onAddRoute }) => {
  const [route, setRoute] = useState('');

  const addRoute = () => {
    // TODO handle errors\
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
  // eslint-disable-next-line
  const [programs, setPrograms] = useState(['qantas']);

  // eslint-disable-next-line
  const [eliteLevels, setEliteLevels] = useState({
    qantas: ['base', 'Silver', 'Gold', 'Platinum'],
  });
  const [routes, setRoutes] = useState([]);
  const [results, setResults] = useState({});

  const onAddRouteClicked = (route) => {
    setRoutes([...routes, route]);
  };

  const onCalculateClicked = async () => {
    const newResults = {};

    for (const route of routes) {
      newResults[route.uuid] = {};

      for (const program of programs) {
        newResults[route.uuid][program] = {};
        for (const eliteLevel of eliteLevels[program]) {
          const calcResults = await calculator.calculate(program, route.segmentInputs, eliteLevel);
          newResults[route.uuid][program][eliteLevel] = calcResults;
        }
      }
    }

    setResults(newResults);
  };

  return (
    <>
      <ProgramComparison
        routes={routes}
        programs={programs}
        eliteLevels={eliteLevels}
        results={results}
      />
      <AddRoute onAddRoute={onAddRouteClicked} />
      <Button onClick={onCalculateClicked}>Calculate</Button>
    </>
  );
}
