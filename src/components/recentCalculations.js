import { buildRouteDisplayString } from '@/utils/routes';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Chip, Collapse, Grid2, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export const RecentCalculationSelection = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalcutionDeleteClick,
  onClearAllClick,
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setOpen(!isOpen)}
        sx={{ cursor: 'pointer' }}
      >
        <Typography>Recent Calculations</Typography>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </Stack>
      <Collapse in={isOpen} timeout="auto">
        <RecentCalculations
          recentCalculations={recentCalculations}
          onRecentCalculationClick={onRecentCalculationClick}
          onRecentCalcutionDeleteClick={onRecentCalcutionDeleteClick}
          onClearAllClick={onClearAllClick}
        />
      </Collapse>
    </Stack>
  );
};

export const RecentCalculations = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalcutionDeleteClick,
  onClearAllClick,
}) => {
  if (!recentCalculations) {
    return <></>;
  }

  const buildChipLabel = (recentCalculation) => {
    const tripType = recentCalculation.tripType === 'one way' ? 'o/w' : 'r/t';

    const routeDisplayString = buildRouteDisplayString(recentCalculation.segmentInputs);

    return `${tripType} ${recentCalculation.eliteStatus} ${routeDisplayString}`;
  };

  const calcChips = recentCalculations.map((recentCalculation, idx) => {
    return (
      <Chip
        size="small"
        key={idx}
        label={buildChipLabel(recentCalculation)}
        onClick={() => onRecentCalculationClick(idx)}
        onDelete={() => onRecentCalcutionDeleteClick(idx)}
      />
    );
  });

  return (
    <Grid2 container spacing={1}>
      {calcChips}
      <ClearAllChip onClick={onClearAllClick} />
    </Grid2>
  );
};

const ClearAllChip = ({ onClick }) => {
  return <Chip size="small" color="primary" label={'Clear All'} onClick={onClick} />;
};
