'use client';

import { v4 as uuidv4 } from 'uuid';
import {
  Autocomplete,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ProgramComparison } from './_components/programComparison';
import { Calculator } from '../_shared/calculators/calculator';
import { getAirport } from '../_shared/utils/airports';
import { Route } from '../_shared/models/route';
import { defaultSegmentInput, SegmentInput } from '../_shared/models/segmentInput';
import {
  getEliteTierLevel,
  getEliteTiersForProgram,
  getSupportedPrograms,
} from './_models/eliteTiers';
import { RouteInput } from './_components/routeInput';

const calculator = new Calculator();

// hack to create a default route with a specific uuid
// this is so nextjs doesn't get mad the initial emtpy segment has differing uuids on the client vs server
export const defaultRoute = new Route([defaultSegmentInput], '00000000-0000-0000-0000-000000000000'); // prettier-ignore

const ProgramSelect = ({ programs, onChange }) => {
  return (
    <Autocomplete
      multiple
      value={programs}
      options={getSupportedPrograms()}
      onChange={(_, value) => onChange(value)}
      renderInput={(params) => <TextField {...params} label="Frequent Flyer Programs" />}
      sx={{ width: '100%', maxWidth: '500px' }}
    />
  );
};

const RouteEntry = ({ title, route, onRouteUpdate, onSubmit, onCancel }) => {
  return (
    <Dialog onClose={onCancel} open={route !== undefined} fullWidth={true} maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <RouteInput route={route} onRouteUpdate={onRouteUpdate} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function Oneworld() {
  const [programs, setPrograms] = useState([]);
  const [eliteTiers, setEliteTiers] = useState({});
  const [routeInEntry, setRouteInEntry] = useState();
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

  const deleteRouteClicked = (routeIdx) => {
    const newRoutes = [...routes];
    newRoutes.splice(routeIdx, 1);
    setRoutes(newRoutes);
  };

  const updateRouteClicked = (routeIdx) => {
    setRouteInEntry(routes[routeIdx]);
  };

  const onAddRouteClicked = () => {
    setRouteInEntry(defaultRoute);
  };

  const onRouteEntrySubmitClicked = () => {
    if (routeInEntry.uuid === defaultRoute.uuid) {
      routeInEntry.uuid = uuidv4();
      setRoutes([...routes, routeInEntry]);
    } else {
      const routeIdx = routes.findIndex((route) => route.uuid === routeInEntry.uuid);
      const newRoutes = [...routes];
      newRoutes[routeIdx] = routeInEntry;
      setRoutes(newRoutes);
    }
    setRouteInEntry(undefined);
  };

  const onRouteEntryCancelClicked = () => {
    setRouteInEntry(undefined);
  };

  const onCalculateClicked = async () => {
    const newResults = {};

    if (programs.length === 0) {
      return;
    }

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
    <Container disableGutters>
      <Grid2 container direction="column" justifyContent="center" alignItems="center" spacing={1}>
        <Typography variant="h4" textAlign="center">
          oneworld Airlines Frequent Flyer Programs Comparer
        </Typography>
        <ProgramSelect programs={programs} onChange={setPrograms} />
        <ProgramComparison
          routes={routes}
          programs={programs}
          eliteTiers={eliteTiers}
          results={results}
          onEliteTierChange={onEliteTierChange}
          updateRouteClicked={updateRouteClicked}
          deleteRouteClicked={deleteRouteClicked}
        />
        <Button variant="contained" onClick={onAddRouteClicked}>
          Add Route
        </Button>
        <Button variant="contained" onClick={onCalculateClicked}>
          Calculate
        </Button>
        <RouteEntry
          title={routeInEntry?.uuid === defaultRoute.uuid ? 'Add Route' : 'Update Route'}
          route={routeInEntry}
          onRouteUpdate={setRouteInEntry}
          onSubmit={onRouteEntrySubmitClicked}
          onCancel={onRouteEntryCancelClicked}
        />
      </Grid2>
    </Container>
  );
}
