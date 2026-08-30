import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export interface EliteStatusInputProps {
  eliteStatus: string;
  onChange: (value: string) => void;
}

export const EliteStatusInput: React.FC<EliteStatusInputProps> = ({ eliteStatus, onChange }) => {
  return (
    <Autocomplete
      disableClearable
      value={eliteStatus}
      options={['Bronze', 'Silver', 'Gold', 'Platinum', 'Platinum One']}
      sx={{ width: 175 }}
      size="small"
      onChange={(_event, value) => onChange(value || '')}
      renderInput={(params) => <TextField {...params} label="Elite Status" />}
    />
  );
};
