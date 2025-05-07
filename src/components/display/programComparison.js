import { buildRouteDisplayString } from '@/utils/routes';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // prettier-ignore

const programLevels = {
  qantas: ['base', 'silver', 'gold', 'platinum'],
};

export const ProgramComparison = ({ routes, programs, results }) => {
  console.log(routes);
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {programs.map((program) => {
              return (
                <TableCell key={program} colSpan={programLevels[program].length}>
                  {program}
                </TableCell>
              );
            })}
          </TableRow>
          <TableRow>
            <TableCell>Routes</TableCell>
            {programs.map((program) => {
              return programLevels[program].map((programLevel) => {
                return <TableCell key={programLevel}>{programLevel}</TableCell>;
              });
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {routes.map((route) => {
            const routeString = buildRouteDisplayString(route);
            return (
              <TableRow key={routeString}>
                <TableCell>{routeString}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
