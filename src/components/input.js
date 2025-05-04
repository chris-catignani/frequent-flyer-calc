import {
  JAL_AIRLINES,
  JAL_DOMESTIC_FARE_CLASS_DISPLAY,
  JAL_DOMESTIC_FARE_CLASSES,
  JETSTAR_AIRLINES,
  JETSTAR_FARE_CLASS_DISPLAY,
  JETSTAR_FARE_CLASSES,
  JETSTAR_NEW_ZEALAND_FARE_CLASSES,
  PARTNER_NON_ONEWORLD_AIRLINES,
  PARTNER_ONEWORLD_AIRLINES,
  QANTAS_DOMESTIC_FARE_CLASSES,
  QANTAS_FARE_CLASS_DISPLAY,
  QANTAS_GRP_AIRLINES,
  QANTAS_INTL_FARE_CLASSES,
  WEBSITE_EARN_CATEGORIES,
} from '@/models/constants';
import { Autocomplete, TextField, Grid2, IconButton, Box, Divider } from '@mui/material';
import { GroupHeader, GroupItems } from './autocomplete';
import { Clear } from '@mui/icons-material';

export const EliteStatusInput = ({ eliteStatus, onChange }) => {
  return (
    <Autocomplete
      disablePortal
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

export const RouteInput = ({
  segmentInput,
  errors,
  showDeleteButton,
  onChange,
  onDeleteClicked,
}) => {
  return (
    <Grid2
      container
      spacing={1}
      columns={21}
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Grid2 size={{ xs: 20, sm: 6 }} order={1}>
        <AirlineInput
          value={segmentInput.airline}
          error={errors['airline']}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({ airline: value });
            if (shouldClearFareClassForAirlineChange(segmentInput, value)) {
              newSegmentInput.fareClass = '';
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid2>
      <Grid2 size={{ xs: 10, sm: 4 }} order={2}>
        <AirportInput
          label={'From (e.g. syd)'}
          value={segmentInput.fromAirportText}
          error={errors['fromAirportText']}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({
              fromAirportText: value,
            });
            if (
              shouldClearFareClassForAirportChange(
                segmentInput.airline,
                segmentInput.fromAirportText,
                value,
              )
            ) {
              newSegmentInput.fareClass = '';
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid2>
      <Grid2 size={{ xs: 10, sm: 4 }} order={3}>
        <AirportInput
          label={'To (e.g. mel)'}
          value={segmentInput.toAirportText}
          error={errors['toAirportText']}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({
              toAirportText: value,
            });
            if (
              shouldClearFareClassForAirportChange(
                segmentInput.airline,
                segmentInput.toAirportText,
                value,
              )
            ) {
              newSegmentInput.fareClass = '';
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid2>
      <Grid2 size={{ xs: 20, sm: 6 }} order={{ xs: 5, sm: 4 }}>
        <FareClassInput
          segmentInput={segmentInput}
          error={errors['fareClass']}
          onChange={(value) => {
            onChange(segmentInput.clone({ fareClass: value }));
          }}
        />
      </Grid2>
      <Grid2
        size={1}
        mb={2} // accommodate for the other fields that have "helper text" to display errors under them
        order={{ xs: 4, sm: 5 }}
      >
        <RemoveRouteInputButton
          showDeleteButton={showDeleteButton}
          onDeleteClicked={onDeleteClicked}
        />
      </Grid2>
    </Grid2>
  );
};

export const RouteInputList = ({
  segmentInputs,
  errors,
  onDeleteSegmentPressed,
  onSegmentInputChanged,
}) => {
  return (
    <Box>
      {segmentInputs.map((segmentInput, segmentInputIdx) => {
        return (
          <Box key={segmentInputIdx}>
            {/* Show divider only on mobile (sx breakpoint) */}
            {segmentInputIdx > 0 && (
              <Divider
                sx={{
                  mb: { xs: 3, sm: 0 },
                  visibility: { sm: 'hidden' },
                }}
              />
            )}
            <RouteInput
              segmentInput={segmentInput}
              showDeleteButton={segmentInputs.length > 1}
              onDeleteClicked={() => onDeleteSegmentPressed(segmentInputIdx)}
              errors={errors[segmentInputIdx] || {}}
              onChange={(segmentInput) => onSegmentInputChanged(segmentInputIdx, segmentInput)}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const RemoveRouteInputButton = ({ showDeleteButton, onDeleteClicked }) => {
  if (!showDeleteButton) {
    return (
      // Dummy icon to maintain space for when we show icons
      <IconButton disabled sx={{ visibility: 'hidden', p: 0 }}>
        <Clear />
      </IconButton>
    );
  } else {
    return (
      <IconButton
        sx={{
          p: 0,
          '&:hover': { backgroundColor: 'inherit', boxShadow: 'none' },
        }}
        onClick={onDeleteClicked}
      >
        <Clear />
      </IconButton>
    );
  }
};

const shouldClearFareClassForAirlineChange = (segmentInput, airline) => {
  // if the airline did not change
  if (airline === segmentInput?.airline) {
    return false;
  }

  // if it used to be a qantas airline, and now it's not.
  // or both are qantas group airlines
  // or used to be a JAL airline, and now isn't
  // or both are JAL group airlines
  return (
    airline in QANTAS_GRP_AIRLINES !== segmentInput?.airline in QANTAS_GRP_AIRLINES ||
    (airline in QANTAS_GRP_AIRLINES && segmentInput?.airline in QANTAS_GRP_AIRLINES) ||
    JAL_AIRLINES.has(airline) !== JAL_AIRLINES.has(segmentInput?.airline) ||
    (JAL_AIRLINES.has(airline) && JAL_AIRLINES.has(segmentInput?.airline))
  );
};

const shouldClearFareClassForAirportChange = (airline, originalAirport, newAirport) => {
  // Because JAL's fare class can toggle between a drop down or free form text, just clear it on any airport change
  if (JAL_AIRLINES.has(airline)) {
    return true;
  }

  // ignore in progress typing
  if (newAirport.length !== 3) {
    return false;
  }

  // to be lazy, clear if this is a qantas grp or JAL airline
  return airline in QANTAS_GRP_AIRLINES || JAL_AIRLINES.has(airline);
};

const AirlineInput = ({ value, error, onChange }) => {
  const buildOptions = (airlines, groupName) => {
    return Object.entries(airlines).map(([iata, name]) => {
      return {
        airlineLabel: `${name} (${iata})`,
        iata,
        groupName,
        id: iata,
      };
    });
  };

  const options = [
    ...buildOptions(QANTAS_GRP_AIRLINES, 'Qantas Group Airlines'),
    ...buildOptions(PARTNER_ONEWORLD_AIRLINES, 'oneworld Partner Airlines'),
    ...buildOptions(PARTNER_NON_ONEWORLD_AIRLINES, 'Other Partner Airlines'),
  ];

  return (
    <Autocomplete
      disablePortal
      disableClearable
      autoHighlight
      autoSelect
      options={options}
      getOptionLabel={(airline) => airline.airlineLabel || ''}
      value={options.find((airline) => airline.iata === value) || ''}
      groupBy={(option) => option.groupName}
      onChange={(_, value) => onChange(value?.iata)}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} error={error} helperText={error ? error : ' '} label="Airline" />
      )}
      renderGroup={(params) => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
    />
  );
};

const AirportInput = ({ label, value, error, onChange }) => {
  return (
    <TextField
      label={label}
      value={value}
      error={error}
      helperText={error ? error : ' '}
      sx={{ width: '100%' }}
      onChange={(event) => {
        onChange(event.target.value?.toLowerCase()?.trim());
      }}
    />
  );
};

const QantasFareClassInput = ({ segmentInput, error, onChange }) => {
  let fareClassOptions = [];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.fromAirport.country === 'Australia' &&
      segmentInput.toAirport.country === 'Australia'
    ) {
      fareClassOptions = Object.keys(QANTAS_DOMESTIC_FARE_CLASSES);
      fareClassOptions.push(
        ...WEBSITE_EARN_CATEGORIES.qf[0]
          .replace(/\W/g, '')
          .split('')
          .map((letter) => letter.toLowerCase())
          .sort(),
      );
    } else {
      fareClassOptions = Object.keys(QANTAS_INTL_FARE_CLASSES);
      fareClassOptions.push(
        ...WEBSITE_EARN_CATEGORIES.qf[1]
          .replace(/\W/g, '')
          .split('')
          .map((letter) => letter.toLowerCase())
          .sort(),
      );
    }
  }

  return (
    <GenericFareClassInput
      options={fareClassOptions}
      value={segmentInput.fareClass || ''}
      displayLookup={QANTAS_FARE_CLASS_DISPLAY}
      onChange={onChange}
      groupBy={(option) => (option.length === 1 ? 'Booking Class' : 'Fare Type')}
      error={error}
    />
  );
};

const JetstarFareClassInput = ({ segmentInput, error, onChange }) => {
  let fareClassOptions = [];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.airline === 'jq' &&
      segmentInput.fromAirport.country === 'New Zealand' &&
      segmentInput.toAirport.country === 'New Zealand'
    ) {
      fareClassOptions = Object.keys(JETSTAR_NEW_ZEALAND_FARE_CLASSES);
    } else {
      fareClassOptions = Object.keys(JETSTAR_FARE_CLASSES);
    }
  }

  return (
    <GenericFareClassInput
      options={fareClassOptions}
      value={segmentInput.fareClass || ''}
      displayLookup={JETSTAR_FARE_CLASS_DISPLAY}
      onChange={onChange}
      error={error}
    />
  );
};

const JALFareClassInput = ({ segmentInput, error, onChange }) => {
  const fareClassOptions = Object.keys(JAL_DOMESTIC_FARE_CLASSES);

  return (
    <GenericFareClassInput
      options={fareClassOptions}
      value={segmentInput.fareClass || ''}
      displayLookup={JAL_DOMESTIC_FARE_CLASS_DISPLAY}
      onChange={onChange}
      error={error}
    />
  );
};

const GenericFareClassInput = ({ options, value, displayLookup, onChange, groupBy, error }) => {
  return (
    <Autocomplete
      disablePortal
      disableClearable
      autoHighlight
      autoSelect
      options={options}
      getOptionLabel={(option) => displayLookup[option] || option}
      value={options.find((option) => option === value) || ''}
      onChange={(_, value) => onChange(value)}
      groupBy={groupBy}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} error={error} helperText={error ? error : ' '} label="Fare Class" />
      )}
      renderGroup={(params) => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
    />
  );
};

const FareClassInput = ({ segmentInput, error, onChange }) => {
  if (segmentInput.airline === 'qf') {
    return <QantasFareClassInput segmentInput={segmentInput} error={error} onChange={onChange} />;
  } else if (JETSTAR_AIRLINES.has(segmentInput.airline)) {
    return <JetstarFareClassInput segmentInput={segmentInput} error={error} onChange={onChange} />;
  } else if (
    JAL_AIRLINES.has(segmentInput.airline) &&
    segmentInput.fromAirport?.country === 'Japan' &&
    segmentInput.toAirport?.country === 'Japan'
  ) {
    return <JALFareClassInput segmentInput={segmentInput} error={error} onChange={onChange} />;
  }

  return (
    <TextField
      value={segmentInput.fareClass}
      error={error}
      helperText={error ? error : ' '}
      onChange={(event) => {
        onChange(event.target.value?.trim()?.toLowerCase());
      }}
      label='Fare Class (e.g. "y" or "i")'
      sx={{ width: '100%' }}
    />
  );
};
