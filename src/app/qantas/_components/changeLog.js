import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, Stack, Typography } from '@mui/material';
import { useState } from 'react';

// Newest month first. Add a new { month, entries } entry at the top when shipping a change.
export const CHANGE_LOG = [
  {
    month: 'June 2026',
    entries: [`Added autocomplete search for "from airport" and "to airport"`],
  },
  {
    month: 'March 2026',
    entries: ['updated earnings rates for recent Jetstar Japan changes'],
  },
];

export const ChangeLog = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setOpen(!isOpen)}
        sx={{ cursor: 'pointer' }}
      >
        <Typography>Recent Updates</Typography>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </Stack>
      <Collapse in={isOpen} timeout="auto">
        <Stack spacing={1.5}>
          {CHANGE_LOG.map(({ month, entries }) => (
            <Stack key={month} spacing={0.5}>
              <Typography variant="subtitle2">{month}</Typography>
              <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 3 }}>
                {entries.map((entry, idx) => (
                  <Typography component="li" variant="body2" key={idx}>
                    {entry}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
