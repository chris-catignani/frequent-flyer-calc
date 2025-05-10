import { buildRouteDisplayString } from '@/app/_shared/utils/routes';
import { Checkbox, FormControlLabel, FormGroup, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material'; // prettier-ignore
import { calcPercentageOfEliteTier, getEliteTiersForProgram } from '../_models/eliteTiers';
import { Delete, Edit } from '@mui/icons-material';

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
        <TableCell></TableCell>
        <TableCell>Routes</TableCell>
        {level1Headers}
      </TableRow>
      <TableRow>
        <TableCell></TableCell>
        <TableCell></TableCell>
        {level2Headers}
      </TableRow>
      <TableRow>
        <TableCell></TableCell>
        <TableCell></TableCell>
        {level3Headers}
      </TableRow>
    </TableHead>
  );
};

const RowActions = ({ updateClicked, deleteClicked }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Tooltip title="Edit Route">
        <IconButton size="small" onClick={updateClicked}>
          <Edit fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Route">
        <IconButton size="small" onClick={deleteClicked}>
          <Delete fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const Body = ({
  routes,
  programs,
  eliteTiers,
  results,
  updateRouteClicked,
  deleteRouteClicked,
}) => {
  const rows = [];

  routes.forEach((route, routeIdx) => {
    const cells = [];

    const routeString = buildRouteDisplayString(route.segmentInputs);
    cells.push(
      <TableCell key={`${route.uuid}-route-actions`}>
        <RowActions
          updateClicked={() => updateRouteClicked(routeIdx)}
          deleteClicked={() => deleteRouteClicked(routeIdx)}
        />
      </TableCell>,
    );
    cells.push(<TableCell key={`${route.uuid}-route`}>{routeString}</TableCell>);

    if (results[route.uuid]) {
      programs.forEach((program) => {
        Object.entries(results[route.uuid][program] || {}).forEach(([eliteTier, result]) => {
          if (!eliteTiers[program].includes(eliteTier)) {
            return;
          }

          const percentOfEliteTier = calcPercentageOfEliteTier(
            program,
            eliteTier,
            result.elitePoints,
            true,
          );

          cells.push(
            <TableCell key={`${route.uuid}-${program}-${eliteTier}-airline-points`}>
              {result.airlinePoints}
            </TableCell>,
            <TableCell key={`${route.uuid}-${program}-${eliteTier}-elite-points`}>
              {result.elitePoints}
            </TableCell>,
            <TableCell key={`${route.uuid}-${program}-${eliteTier}-elite-percent`}>
              {formatAsPercentage(percentOfEliteTier)}
            </TableCell>,
          );
        });
      });
    }

    rows.push(<TableRow key={route.uuid}>{cells}</TableRow>);
  });

  return <TableBody>{rows}</TableBody>;
};

export const ProgramComparison = ({
  routes,
  programs,
  eliteTiers,
  results,
  onEliteTierChange,
  updateRouteClicked,
  deleteRouteClicked,
}) => {
  return (
    <TableContainer>
      <Table>
        <Header programs={programs} eliteTiers={eliteTiers} onEliteTierChange={onEliteTierChange} />
        <Body
          routes={routes}
          programs={programs}
          eliteTiers={eliteTiers}
          results={results}
          updateRouteClicked={updateRouteClicked}
          deleteRouteClicked={deleteRouteClicked}
        />
      </Table>
    </TableContainer>
  );
};
