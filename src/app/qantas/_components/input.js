import { Autocomplete, TextField } from '@mui/material';

export const EliteStatusInput = ({ eliteStatus, onChange }) => {
  return (
    <Autocomplete
      disableClearable
      value={eliteStatus}
      options={['Bronze', 'Silver', 'Gold', 'Platinum', 'Platinum One']}
      sx={{ width: 175 }}
      size="small"
      onChange={(_, value) => onChange(value)}
      renderInput={(params) => <TextField {...params} label="Elite Status" />}
    />
  );
};
