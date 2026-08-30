import React, { useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
} from '@hello-pangea/dnd';
import { Clear, DragHandle } from '@mui/icons-material';
import { Autocomplete, Box, Divider, Grid, IconButton, TextField, Typography } from '@mui/material';
import {
  JAL_AIRLINES,
  JAL_DOMESTIC_FARE_CLASS_DISPLAY,
  JAL_DOMESTIC_FARE_CLASSES,
  JETSTAR_AIRLINES,
  JETSTAR_DOMESTIC_FARE_CLASSES,
  JETSTAR_FARE_CLASS_DISPLAY,
  JETSTAR_INTL_FARE_CLASSES,
  JETSTAR_NEW_ZEALAND_FARE_CLASSES,
  QANTAS_DOMESTIC_FARE_CLASSES,
  QANTAS_FARE_CLASS_DISPLAY,
  QANTAS_INTL_FARE_CLASSES,
  WEBSITE_EARN_CATEGORIES,
} from '@/app/_shared/models/qantasConstants';
import { GroupHeader, GroupItems } from '@/app/_shared/components/autocomplete';
import { ALL_AIRLINES, QANTAS_GRP_AIRLINES } from '@/app/_shared/models/constants';
import { searchAirports } from '@/app/_shared/utils/airports';
import { SegmentInput } from '@/app/_shared/models/segmentInput';
import type { Airport } from '@/types/airport';

export interface AirlineOption {
  airlineLabel: string;
  iata: string;
  groupName: string;
  id: string;
}

export type SegmentErrors = Record<number, Record<string, string>>;

/**
 * Helper function to build the options for the airline dropdown
 */
export const buildAirlineOptions = (airlines: string[], groupName: string): AirlineOption[] => {
  return airlines.map((iata) => {
    return {
      airlineLabel: `${ALL_AIRLINES[iata]} (${iata})`,
      iata,
      groupName,
      id: iata,
    };
  });
};

export const validate = (segmentInputs: SegmentInput[]): SegmentErrors => {
  const errors: SegmentErrors = {};

  const addError = (segmentInputIdx: number, fieldName: string, error: string) => {
    if (!errors[segmentInputIdx]) {
      errors[segmentInputIdx] = {};
    }
    errors[segmentInputIdx][fieldName] = error;
  };

  segmentInputs.forEach((segmentInput, idx) => {
    if (!segmentInput.airline) {
      addError(idx, 'airline', 'Required');
    }
    if (!segmentInput.fromAirportText) {
      addError(idx, 'fromAirportText', 'Required');
    }
    if (!segmentInput.toAirportText) {
      addError(idx, 'toAirportText', 'Required');
    }
    if (!segmentInput.fareClass) {
      addError(idx, 'fareClass', 'Required');
    }

    if (segmentInput.fromAirportText && !segmentInput.fromAirport) {
      addError(idx, 'fromAirportText', 'Invalid IATA');
    }
    if (segmentInput.toAirportText && !segmentInput.toAirport) {
      addError(idx, 'toAirportText', 'Invalid IATA');
    }
  });

  return errors;
};

export interface SegmentInputListProps {
  segmentInputs: SegmentInput[];
  errors: SegmentErrors;
  airlineOptions: AirlineOption[];
  onDeleteSegmentPressed: (idx: number) => void;
  onSegmentInputChanged: (idx: number, segmentInput: SegmentInput) => void;
  onSegmentsReordered: (sourceIdx: number, destIdx: number) => void;
}

export const SegmentInputList: React.FC<SegmentInputListProps> = ({
  segmentInputs,
  errors,
  airlineOptions,
  onDeleteSegmentPressed,
  onSegmentInputChanged,
  onSegmentsReordered,
}) => {
  // https://medium.com/@rekdhmer/how-to-drag-drop-like-trello-b21c4e821429
  const onDragEnd = (result: DropResult) => {
    if (result.destination && result.source.index !== result.destination.index) {
      onSegmentsReordered(result.source.index, result.destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="segmentList">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {segmentInputs.map((segmentInput, segmentInputIdx) => (
              <SegmentInputListItem
                key={segmentInput.uuid}
                segmentInput={segmentInput}
                segmentInputIdx={segmentInputIdx}
                showDeleteButton={segmentInputs.length > 1}
                enableDrag={segmentInputs.length > 1}
                errors={errors[segmentInputIdx] || {}}
                airlineOptions={airlineOptions}
                onDeleteSegmentPressed={onDeleteSegmentPressed}
                onSegmentInputChanged={onSegmentInputChanged}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

interface SegmentInputListItemProps {
  segmentInput: SegmentInput;
  segmentInputIdx: number;
  showDeleteButton: boolean;
  enableDrag: boolean;
  errors: Record<string, string>;
  airlineOptions: AirlineOption[];
  onDeleteSegmentPressed: (idx: number) => void;
  onSegmentInputChanged: (idx: number, segmentInput: SegmentInput) => void;
}

const SegmentInputListItem: React.FC<SegmentInputListItemProps> = ({
  segmentInput,
  segmentInputIdx,
  showDeleteButton,
  enableDrag,
  errors,
  airlineOptions,
  onDeleteSegmentPressed,
  onSegmentInputChanged,
}) => {
  return (
    <Draggable draggableId={segmentInput.uuid} index={segmentInputIdx} isDragDisabled={!enableDrag}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <Divider
            sx={{
              mb: { xs: 3, sm: 0 },
              visibility: { sm: 'hidden' },
            }}
          />
          <SegmentInputRow
            segmentInput={segmentInput}
            errors={errors}
            dragHandleProps={provided.dragHandleProps}
            showDeleteButton={showDeleteButton}
            airlineOptions={airlineOptions}
            onDeleteClicked={() => onDeleteSegmentPressed(segmentInputIdx)}
            onChange={(newSegmentInput) => onSegmentInputChanged(segmentInputIdx, newSegmentInput)}
          />
        </div>
      )}
    </Draggable>
  );
};

interface SegmentInputRowProps {
  segmentInput: SegmentInput;
  errors: Record<string, string>;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  showDeleteButton: boolean;
  airlineOptions: AirlineOption[];
  onChange: (segmentInput: SegmentInput) => void;
  onDeleteClicked: () => void;
}

const SegmentInputRow: React.FC<SegmentInputRowProps> = ({
  segmentInput,
  errors,
  dragHandleProps,
  showDeleteButton,
  airlineOptions,
  onChange,
  onDeleteClicked,
}) => {
  return (
    <Grid
      container
      spacing={1}
      columns={22}
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Grid
        size={{ xs: 2, sm: 1 }}
        mb={2} // accommodate for the other fields that have "helper text" to display errors under them
        order={{ xs: 2, sm: 1 }}
        {...dragHandleProps}
      >
        <ReorderSegmentInputButton showReorderButton={showDeleteButton} />
      </Grid>
      <Grid size={{ xs: 22, sm: 6 }} order={{ xs: 1, sm: 2 }}>
        <AirlineInput
          value={segmentInput.airline}
          error={errors['airline']}
          airlineOptions={airlineOptions}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({ airline: value });
            if (shouldClearFareClassForAirlineChange(segmentInput, value)) {
              newSegmentInput.fareClass = '';
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid>
      <Grid size={{ xs: 9, sm: 4 }} order={3}>
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
      </Grid>
      <Grid size={{ xs: 9, sm: 4 }} order={4}>
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
      </Grid>
      <Grid size={{ xs: 22, sm: 6 }} order={{ xs: 6, sm: 5 }}>
        <FareClassInput
          segmentInput={segmentInput}
          error={errors['fareClass']}
          onChange={(value) => {
            onChange(segmentInput.clone({ fareClass: value }));
          }}
        />
      </Grid>
      <Grid
        size={{ xs: 2, sm: 1 }}
        mb={2} // accommodate for the other fields that have "helper text" to display errors under them
        order={{ xs: 5, sm: 6 }}
      >
        <RemoveSegmentInputButton
          showDeleteButton={showDeleteButton}
          onDeleteClicked={onDeleteClicked}
        />
      </Grid>
    </Grid>
  );
};

const ReorderSegmentInputButton: React.FC<{ showReorderButton: boolean }> = ({
  showReorderButton,
}) => {
  if (!showReorderButton) {
    return (
      // Dummy icon to maintain space for when we show icons
      <IconButton disabled sx={{ visibility: 'hidden', p: 0 }}>
        <DragHandle />
      </IconButton>
    );
  } else {
    return (
      <IconButton
        sx={{
          p: 0,
          cursor: 'grab',
        }}
      >
        <DragHandle />
      </IconButton>
    );
  }
};

const RemoveSegmentInputButton: React.FC<{
  showDeleteButton: boolean;
  onDeleteClicked: () => void;
}> = ({ showDeleteButton, onDeleteClicked }) => {
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

const shouldClearFareClassForAirlineChange = (
  segmentInput: SegmentInput | undefined,
  airline: string,
): boolean => {
  // if the airline did not change
  if (airline === segmentInput?.airline) {
    return false;
  }

  // if it used to be a qantas airline, and now it's not.
  // or both are qantas group airlines
  // or used to be a JAL airline, and now isn't
  // or both are JAL group airlines
  const wasQantas = Boolean(segmentInput?.airline && segmentInput.airline in QANTAS_GRP_AIRLINES);
  const isQantas = airline in QANTAS_GRP_AIRLINES;
  const wasJal = Boolean(segmentInput?.airline && JAL_AIRLINES.has(segmentInput.airline));
  const isJal = JAL_AIRLINES.has(airline);

  return isQantas !== wasQantas || (isQantas && wasQantas) || isJal !== wasJal || (isJal && wasJal);
};

const shouldClearFareClassForAirportChange = (
  airline: string,
  _originalAirport: string,
  newAirport: string,
): boolean => {
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

interface AirlineInputProps {
  value: string;
  error?: string;
  airlineOptions: AirlineOption[];
  onChange: (value: string) => void;
}

const AirlineInput: React.FC<AirlineInputProps> = ({ value, error, airlineOptions, onChange }) => {
  const selectedOption =
    airlineOptions.find((airline) => airline.iata === value) ?? airlineOptions[0];

  return (
    <Autocomplete
      disableClearable
      autoHighlight
      autoSelect
      options={airlineOptions}
      getOptionLabel={(airline) =>
        typeof airline === 'string' ? airline : airline.airlineLabel || ''
      }
      value={selectedOption}
      groupBy={(option) => option.groupName}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === 'object') {
          onChange(newValue.iata);
        }
      }}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={Boolean(error)}
          helperText={error ? error : ' '}
          label="Airline"
        />
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

interface AirportInputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const AirportInput: React.FC<AirportInputProps> = ({ label, value, error, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const options = useMemo(() => searchAirports(value), [value]);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      autoHighlight
      options={options}
      filterOptions={(presetOptions) => presetOptions}
      inputValue={!focused || justSelected ? (value || '').toUpperCase() : value || ''}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === 'input' || reason === 'selectOption') {
          setJustSelected(reason === 'selectOption');
          onChange(newInputValue.toLowerCase());
        }
      }}
      onChange={(_event, newValue) => {
        if (newValue && typeof newValue === 'object') {
          setJustSelected(true);
          onChange((newValue as Airport).iata.toLowerCase());
        }
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.iata ? option.iata.toLowerCase() : ''
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const airport = option as Airport;
        return (
          <li key={key} {...optionProps} onMouseDown={(event) => event.preventDefault()}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" component="span">
                {airport.iata?.toUpperCase()} — {airport.name}
              </Typography>
              <Typography variant="caption" component="span" color="text.secondary">
                {airport.city}, {airport.country}
              </Typography>
            </Box>
          </li>
        );
      }}
      slotProps={{
        popper: { placement: 'bottom-start', style: { width: 'fit-content' } },
        paper: { sx: { minWidth: 280, maxWidth: 400 } },
      }}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={Boolean(error)}
          helperText={error ? error : ' '}
          onFocus={() => {
            setFocused(true);
            setJustSelected(false);
          }}
          onBlur={() => setFocused(false)}
        />
      )}
    />
  );
};

interface FareClassInputSubProps {
  segmentInput: SegmentInput;
  error?: string;
  onChange: (value: string) => void;
}

const QantasFareClassInput: React.FC<FareClassInputSubProps> = ({
  segmentInput,
  error,
  onChange,
}) => {
  let fareClassOptions: string[] = [];
  const qfWebCategories = WEBSITE_EARN_CATEGORIES.qf as string[];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.fromAirport.country === 'Australia' &&
      segmentInput.toAirport.country === 'Australia'
    ) {
      fareClassOptions = Object.keys(QANTAS_DOMESTIC_FARE_CLASSES);
      fareClassOptions.push(
        ...qfWebCategories[0]
          .replace(/\W/g, '')
          .split('')
          .map((letter) => letter.toLowerCase())
          .sort(),
      );
    } else {
      fareClassOptions = Object.keys(QANTAS_INTL_FARE_CLASSES);
      fareClassOptions.push(
        ...qfWebCategories[1]
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

const JetstarFareClassInput: React.FC<FareClassInputSubProps> = ({
  segmentInput,
  error,
  onChange,
}) => {
  let fareClassOptions: string[] = [];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.airline === 'jq' &&
      segmentInput.fromAirport.country === 'New Zealand' &&
      segmentInput.toAirport.country === 'New Zealand'
    ) {
      fareClassOptions = Object.keys(JETSTAR_NEW_ZEALAND_FARE_CLASSES);
    } else if (
      segmentInput.airline === 'jq' &&
      segmentInput.fromAirport.country === 'Australia' &&
      segmentInput.toAirport.country === 'Australia'
    ) {
      fareClassOptions = Object.keys(JETSTAR_DOMESTIC_FARE_CLASSES);
    } else {
      fareClassOptions = Object.keys(JETSTAR_INTL_FARE_CLASSES);
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

const JALFareClassInput: React.FC<FareClassInputSubProps> = ({ segmentInput, error, onChange }) => {
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

interface GenericFareClassInputProps {
  options: string[];
  value: string;
  displayLookup: Record<string, string>;
  onChange: (value: string) => void;
  groupBy?: (option: string) => string;
  error?: string;
}

const GenericFareClassInput: React.FC<GenericFareClassInputProps> = ({
  options,
  value,
  displayLookup,
  onChange,
  groupBy,
  error,
}) => {
  return (
    <Autocomplete
      disableClearable
      autoHighlight
      autoSelect
      options={options}
      getOptionLabel={(option) => displayLookup[option] || option}
      value={options.find((option) => option === value) || ''}
      onChange={(_event, newValue) => onChange(newValue || '')}
      groupBy={groupBy}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={Boolean(error)}
          helperText={error ? error : ' '}
          label="Fare Class"
        />
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

const FareClassInput: React.FC<FareClassInputSubProps> = ({ segmentInput, error, onChange }) => {
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
      error={Boolean(error)}
      helperText={error ? error : ' '}
      onChange={(event) => {
        onChange(event.target.value?.trim()?.toLowerCase());
      }}
      label='Fare Class (e.g. "y" or "i")'
      sx={{ width: '100%' }}
    />
  );
};
