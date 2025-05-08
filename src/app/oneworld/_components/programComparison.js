import { buildRouteDisplayString } from '@/app/_shared/utils/routes';
import { Checkbox, FormControlLabel, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // prettier-ignore
import { calcPercentageOfEliteTier, getEliteTiersForProgram } from '../_models/eliteTiers';

const Header = ({ programs, eliteTiers, onEliteTierChange }) => {
  const level1Headers = [];
  const level2Headers = [];
  const level3Headers = [];

  programs.forEach((program) => {
    // build list of checkboxes for each elite status of the program
    const eliteCheckboxes = getEliteTiersForProgram(program).map((eliteTier) => {
      return (
        <FormControlLabel
          key={`${program}-${eliteTier}-elite-checkbox`}
          checked={eliteTiers[program].includes(eliteTier)}
          control={<Checkbox />}
          label={eliteTier}
          onChange={(event) => {
            onEliteTierChange(program, eliteTier, event.target.checked);
          }}
        />
      );
    });

    level1Headers.push(
      <TableCell key={`${program}-header`} colSpan={eliteTiers[program].length * 3}>
        {program}
        <FormGroup row>{eliteCheckboxes}</FormGroup>
      </TableCell>,
    );

    eliteTiers[program].map((eliteTier) => {
      level2Headers.push(
        <TableCell key={`${program}-${eliteTier}`} colSpan={3}>
          {eliteTier}
        </TableCell>,
      );

      level3Headers.push(
        <TableCell key={`${program}-${eliteTier}-airline-points`}>Airline Points</TableCell>,
        <TableCell key={`${program}-${eliteTier}-elite-points`}>Elite Points</TableCell>,
        <TableCell key={`${program}-${eliteTier}-elite-percent`}>Percent of Tier</TableCell>,
      );
    });
  });

  return (
    <TableHead>
      <TableRow>
        <TableCell>Routes</TableCell>
        {level1Headers}
      </TableRow>
      <TableRow>
        <TableCell></TableCell>
        {level2Headers}
      </TableRow>
      <TableRow>
        <TableCell></TableCell>
        {level3Headers}
      </TableRow>
    </TableHead>
  );
};

const Body = ({ routes, eliteTiers, results }) => {
  const rows = [];

  routes.forEach((route) => {
    const cells = [];
    const routeString = buildRouteDisplayString(route.segmentInputs);

    cells.push(<TableCell key={`${route.uuid}-route`}>{routeString}</TableCell>);

    routes.forEach((route) => {
      if (!results[route.uuid]) {
        cells.push(<TableCell key={route.uuid}></TableCell>); // TODO specify colspan?
        return;
      }

      //TODO get the specific program here
      const program = 'qantas';

      Object.entries(results[route.uuid][program]).forEach(([eliteTier, result]) => {
        if (!eliteTiers[program].includes(eliteTier)) {
          return;
        }

        cells.push(
          <TableCell key={`${route.uuid}-${program}-${eliteTier}-airline-points`}>
            {result.airlinePoints}
          </TableCell>,
          <TableCell key={`${route.uuid}-${program}-${eliteTier}-elite-points`}>
            {result.elitePoints}
          </TableCell>,
          <TableCell key={`${route.uuid}-${program}-${eliteTier}-elite-percent`}>
            {calcPercentageOfEliteTier(program, eliteTier, result.elitePoints, true)}
          </TableCell>,
        );
      });
    });

    rows.push(<TableRow key={route.uuid}>{cells}</TableRow>);
  });

  return <TableBody>{rows}</TableBody>;
};

export const ProgramComparison = ({ routes, programs, eliteTiers, onEliteTierChange, results }) => {
  return (
    <TableContainer>
      <Table>
        <Header programs={programs} eliteTiers={eliteTiers} onEliteTierChange={onEliteTierChange} />
        <Body routes={routes} eliteTiers={eliteTiers} results={results} />
      </Table>
    </TableContainer>
  );
};
