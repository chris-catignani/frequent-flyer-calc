import { buildRouteDisplayString } from '@/app/_shared/utils/routes';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // prettier-ignore
import { calcPercentageOfEliteTier } from '../_models/eliteTiers';

const Header = ({ programs, eliteTiers }) => {
  const level1Headers = [];
  const level2Headers = [];
  const level3Headers = [];

  programs.forEach((program) => {
    level1Headers.push(
      <TableCell key={`${program}-header`} colSpan={eliteTiers[program].length * 3}>
        {program}
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

const Body = ({ routes, results }) => {
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

export const ProgramComparison = ({ routes, programs, eliteTiers, results }) => {
  return (
    <TableContainer>
      <Table>
        <Header programs={programs} eliteTiers={eliteTiers} />
        <Body routes={routes} results={results} />
      </Table>
    </TableContainer>
  );
};
