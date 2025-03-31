import { Box, Chip, Grid2, Typography } from '@mui/material';

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

    // create an array of continuous route segments, not duplicating start and end airports
    // e.g. [ [jfk-dfw-phx], [psp-lax] ]
    const airportSegmentChains = recentCalculation.segmentInputs.reduce(
      (airportSegmentChains, segmentInput) => {
        if (airportSegmentChains.length === 0) {
          airportSegmentChains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
        } else {
          const curSegmentChain = airportSegmentChains.pop();
          if (curSegmentChain[curSegmentChain.length - 1] === segmentInput.fromAirportText) {
            curSegmentChain.push(segmentInput.toAirportText);
            airportSegmentChains.push(curSegmentChain);
          } else {
            airportSegmentChains.push(curSegmentChain);
            airportSegmentChains.push([segmentInput.fromAirportText, segmentInput.toAirportText]);
          }
        }
        return airportSegmentChains;
      },
      [],
    );

    const airportSegmentChainsString = airportSegmentChains.map((airportSegmentChain) => {
      return airportSegmentChain.join('-');
    });

    return `${tripType} ${recentCalculation.eliteStatus} ${airportSegmentChainsString.join(', ')}`;
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
    <Box>
      <Typography>Recent Calculations</Typography>
      <Grid2 container spacing={1}>
        {calcChips}
        <ClearAllChip onClick={onClearAllClick} />
      </Grid2>
    </Box>
  );
};

const ClearAllChip = ({ onClick }) => {
  return <Chip size="small" color="primary" label={'Clear All'} onClick={onClick} />;
};
