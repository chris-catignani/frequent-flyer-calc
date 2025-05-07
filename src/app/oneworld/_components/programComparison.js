import { buildRouteDisplayString } from '@/app/_shared/utils/routes';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // prettier-ignore

const Header = ({ programs, eliteLevels }) => {
  const level1Headers = [];
  const level2Headers = [];
  const level3Headers = [];

  programs.forEach((program) => {
    level1Headers.push(
      <TableCell key={`${program}-header`} colSpan={eliteLevels[program].length * 2}>
        {program}
      </TableCell>,
    );

    eliteLevels[program].map((programLevel) => {
      level2Headers.push(
        <TableCell key={`${program}-${programLevel}`} colSpan={2}>
          {programLevel}
        </TableCell>,
      );

      level3Headers.push(
        <TableCell key={`${program}-${programLevel}-airline-points`}>Airline Points</TableCell>,
        <TableCell key={`${program}-${programLevel}-elite-points`}>Elite Points</TableCell>,
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
      Object.entries(results[route.uuid]['qantas']).forEach(([eliteLevel, result]) => {
        cells.push(
          <TableCell key={`${route.uuid}-qantas-${eliteLevel}-airline-points`}>
            {result.airlinePoints}
          </TableCell>,
          <TableCell key={`${route.uuid}-qantas-${eliteLevel}-elite-points`}>
            {result.elitePoints}
          </TableCell>,
        );
      });
    });

    rows.push(<TableRow key={route.uuid}>{cells}</TableRow>);
  });

  return <TableBody>{rows}</TableBody>;
};

export const ProgramComparison = ({ routes, programs, eliteLevels, results }) => {
  return (
    <TableContainer>
      <Table>
        <Header programs={programs} eliteLevels={eliteLevels} />
        <Body routes={routes} results={results} />
      </Table>
    </TableContainer>
  );
};
