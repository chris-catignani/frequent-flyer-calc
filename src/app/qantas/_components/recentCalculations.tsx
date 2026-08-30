import React, { useState } from 'react';
import { buildRouteDisplayString } from '@/app/_shared/utils/routes';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Chip, Collapse, Grid, Stack, Typography } from '@mui/material';
import type { SavedCalculation } from '@/app/_shared/utils/recentCalculations';

export interface RecentCalculationSelectionProps {
  recentCalculations: SavedCalculation[];
  onRecentCalculationClick: (idx: number) => void;
  onRecentCalcutionDeleteClick: (idx: number) => void;
  onClearAllClick: () => void;
}

export const RecentCalculationSelection: React.FC<RecentCalculationSelectionProps> = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalcutionDeleteClick,
  onClearAllClick,
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <Stack spacing={1}>
      <Stack
        data-testid="recent-calculations-toggle"
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

export interface RecentCalculationsProps {
  recentCalculations: SavedCalculation[];
  onRecentCalculationClick: (idx: number) => void;
  onRecentCalcutionDeleteClick: (idx: number) => void;
  onClearAllClick: () => void;
}

export const RecentCalculations: React.FC<RecentCalculationsProps> = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalcutionDeleteClick,
  onClearAllClick,
}) => {
  if (!recentCalculations) {
    return <></>;
  }

  const buildChipLabel = (recentCalculation: SavedCalculation) => {
    const tripType = recentCalculation.tripType === 'one way' ? 'o/w' : 'r/t';

    const routeDisplayString = buildRouteDisplayString(recentCalculation.segmentInputs);

    return `${tripType} ${recentCalculation.eliteStatus} ${routeDisplayString}`;
  };

  const calcChips = recentCalculations.map((recentCalculation, idx) => {
    return (
      <Chip
        data-testid={`recent-calculation-chip-${idx}`}
        size="small"
        key={idx}
        label={buildChipLabel(recentCalculation)}
        onClick={() => onRecentCalculationClick(idx)}
        onDelete={() => onRecentCalcutionDeleteClick(idx)}
      />
    );
  });

  return (
    <Grid container spacing={1}>
      {calcChips}
      <ClearAllChip onClick={onClearAllClick} />
    </Grid>
  );
};

const ClearAllChip: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Chip
      data-testid="recent-calculations-clear-all"
      size="small"
      color="primary"
      label={'Clear All'}
      onClick={onClick}
    />
  );
};
