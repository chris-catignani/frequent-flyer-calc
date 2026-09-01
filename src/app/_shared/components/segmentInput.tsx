import React, { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
} from "@hello-pangea/dnd";
import { Clear, DragHandle } from "@mui/icons-material";
import { Autocomplete, Box, Divider, Grid, IconButton, TextField, Typography } from "@mui/material";
import { GroupHeader, GroupItems } from "@/app/_shared/components/autocomplete";
import { ALL_AIRLINES } from "@/app/_shared/models/constants";
import { searchAirports } from "@/app/_shared/utils/airports";
import { SegmentInput } from "@/app/_shared/models/segmentInput";
import type { Airport } from "@/types/airport";

export interface FareClassInputRenderProps {
  segmentInputIdx: number;
  segmentInput: SegmentInput;
  error?: string;
  onChange: (value: string) => void;
}

export interface SegmentInputAdapter {
  renderFareClassInput?: (props: FareClassInputRenderProps) => React.ReactNode | null | undefined;
  shouldClearFareClassOnAirlineChange?: (segment: SegmentInput, newAirline: string) => boolean;
  shouldClearFareClassOnAirportChange?: (
    segment: SegmentInput,
    field: "from" | "to",
    newAirportText: string
  ) => boolean;
  validateSegment?: (segment: SegmentInput, idx: number) => Record<string, string> | undefined;
}

export interface GenericFareClassInputProps {
  segmentInputIdx: number;
  options: string[];
  value: string;
  displayLookup: Record<string, string>;
  onChange: (value: string) => void;
  groupBy?: (option: string) => string;
  error?: string;
}

export const GenericFareClassInput: React.FC<GenericFareClassInputProps> = ({
  segmentInputIdx,
  options,
  value,
  displayLookup,
  onChange,
  groupBy,
  error,
}) => {
  return (
    <Autocomplete
      data-testid={`segment-fare-class-${segmentInputIdx}`}
      disableClearable
      autoHighlight
      autoSelect
      options={options}
      getOptionLabel={(option) => displayLookup[option] || option}
      value={options.find((option) => option === value) || ""}
      onChange={(_event, newValue) => onChange(newValue || "")}
      groupBy={groupBy}
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={Boolean(error)}
          helperText={
            <span data-testid={`segment-error-fare-class-${segmentInputIdx}`}>
              {error ? error : " "}
            </span>
          }
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

export const validate = (
  segmentInputs: SegmentInput[],
  adapter?: SegmentInputAdapter
): SegmentErrors => {
  const errors: SegmentErrors = {};

  const addError = (segmentInputIdx: number, fieldName: string, error: string) => {
    if (!errors[segmentInputIdx]) {
      errors[segmentInputIdx] = {};
    }
    errors[segmentInputIdx][fieldName] = error;
  };

  segmentInputs.forEach((segmentInput, idx) => {
    if (!segmentInput.airline) {
      addError(idx, "airline", "Required");
    }
    if (!segmentInput.fromAirportText) {
      addError(idx, "fromAirportText", "Required");
    }
    if (!segmentInput.toAirportText) {
      addError(idx, "toAirportText", "Required");
    }
    if (!segmentInput.fareClass) {
      addError(idx, "fareClass", "Required");
    }

    if (segmentInput.fromAirportText && !segmentInput.fromAirport) {
      addError(idx, "fromAirportText", "Invalid IATA");
    }
    if (segmentInput.toAirportText && !segmentInput.toAirport) {
      addError(idx, "toAirportText", "Invalid IATA");
    }

    if (adapter?.validateSegment) {
      const customErrors = adapter.validateSegment(segmentInput, idx);
      if (customErrors) {
        Object.entries(customErrors).forEach(([fieldName, err]) => {
          addError(idx, fieldName, err);
        });
      }
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
  adapter?: SegmentInputAdapter;
}

export const SegmentInputList: React.FC<SegmentInputListProps> = ({
  segmentInputs,
  errors,
  airlineOptions,
  onDeleteSegmentPressed,
  onSegmentInputChanged,
  onSegmentsReordered,
  adapter,
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
                adapter={adapter}
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
  adapter?: SegmentInputAdapter;
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
  adapter,
}) => {
  return (
    <Draggable draggableId={segmentInput.uuid} index={segmentInputIdx} isDragDisabled={!enableDrag}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          {segmentInputIdx > 0 && (
            <Divider
              sx={{
                my: { xs: 2.5, sm: 1.5 },
                visibility: { sm: "hidden" },
              }}
            />
          )}
          <SegmentInputRow
            segmentInput={segmentInput}
            segmentInputIdx={segmentInputIdx}
            errors={errors}
            dragHandleProps={provided.dragHandleProps}
            showDeleteButton={showDeleteButton}
            airlineOptions={airlineOptions}
            onDeleteClicked={() => onDeleteSegmentPressed(segmentInputIdx)}
            onChange={(newSegmentInput) => onSegmentInputChanged(segmentInputIdx, newSegmentInput)}
            adapter={adapter}
          />
        </div>
      )}
    </Draggable>
  );
};

interface SegmentInputRowProps {
  segmentInput: SegmentInput;
  segmentInputIdx: number;
  errors: Record<string, string>;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  showDeleteButton: boolean;
  airlineOptions: AirlineOption[];
  onChange: (segmentInput: SegmentInput) => void;
  onDeleteClicked: () => void;
  adapter?: SegmentInputAdapter;
}

const SegmentInputRow: React.FC<SegmentInputRowProps> = ({
  segmentInput,
  segmentInputIdx,
  errors,
  dragHandleProps,
  showDeleteButton,
  airlineOptions,
  onChange,
  onDeleteClicked,
  adapter,
}) => {
  const customFareClassInput = adapter?.renderFareClassInput?.({
    segmentInputIdx,
    segmentInput,
    error: errors["fareClass"],
    onChange: (val) => onChange(segmentInput.clone({ fareClass: val })),
  });

  return (
    <Grid
      data-testid={`segment-row-${segmentInputIdx}`}
      container
      spacing={1}
      columns={{ xs: 12, sm: 22 }}
      sx={{
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Grid
        size={{ xs: 8, sm: 1 }}
        order={{ xs: 1, sm: 1 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "center" },
          height: { xs: "40px", sm: "56px" },
          gap: 1,
        }}
        {...dragHandleProps}
      >
        <ReorderSegmentInputButton showReorderButton={showDeleteButton} />
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ display: { xs: "inline", sm: "none" }, fontWeight: 500 }}
        >
          Segment {segmentInputIdx + 1}
        </Typography>
      </Grid>
      <Grid
        size={{ xs: 4, sm: 1 }}
        order={{ xs: 2, sm: 6 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-end", sm: "center" },
          height: { xs: "40px", sm: "56px" },
        }}
      >
        <RemoveSegmentInputButton
          segmentInputIdx={segmentInputIdx}
          showDeleteButton={showDeleteButton}
          onDeleteClicked={onDeleteClicked}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 3, sm: 2 }}>
        <AirlineInput
          segmentInputIdx={segmentInputIdx}
          value={segmentInput.airline}
          error={errors["airline"]}
          airlineOptions={airlineOptions}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({ airline: value });
            const shouldClear =
              adapter?.shouldClearFareClassOnAirlineChange?.(segmentInput, value) ?? false;
            if (shouldClear) {
              newSegmentInput.fareClass = "";
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 4, sm: 3 }}>
        <AirportInput
          dataTestId={`segment-from-${segmentInputIdx}`}
          errorTestId={`segment-error-from-${segmentInputIdx}`}
          label={"From (e.g. syd)"}
          value={segmentInput.fromAirportText}
          error={errors["fromAirportText"]}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({
              fromAirportText: value,
            });
            const shouldClear =
              adapter?.shouldClearFareClassOnAirportChange?.(segmentInput, "from", value) ?? false;
            if (shouldClear) {
              newSegmentInput.fareClass = "";
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }} order={{ xs: 5, sm: 4 }}>
        <AirportInput
          dataTestId={`segment-to-${segmentInputIdx}`}
          errorTestId={`segment-error-to-${segmentInputIdx}`}
          label={"To (e.g. mel)"}
          value={segmentInput.toAirportText}
          error={errors["toAirportText"]}
          onChange={(value) => {
            const newSegmentInput = segmentInput.clone({
              toAirportText: value,
            });
            const shouldClear =
              adapter?.shouldClearFareClassOnAirportChange?.(segmentInput, "to", value) ?? false;
            if (shouldClear) {
              newSegmentInput.fareClass = "";
            }
            onChange(newSegmentInput);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} order={{ xs: 6, sm: 5 }}>
        {customFareClassInput != null ? (
          customFareClassInput
        ) : (
          <TextField
            data-testid={`segment-fare-class-${segmentInputIdx}`}
            value={segmentInput.fareClass}
            error={Boolean(errors["fareClass"])}
            helperText={
              <span data-testid={`segment-error-fare-class-${segmentInputIdx}`}>
                {errors["fareClass"] ? errors["fareClass"] : " "}
              </span>
            }
            onChange={(event) => {
              onChange(
                segmentInput.clone({ fareClass: event.target.value?.trim()?.toLowerCase() })
              );
            }}
            label='Fare Class (e.g. "y" or "i")'
            sx={{ width: "100%" }}
          />
        )}
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
      <IconButton disabled sx={{ visibility: "hidden", p: 0 }}>
        <DragHandle />
      </IconButton>
    );
  } else {
    return (
      <IconButton
        sx={{
          p: 0,
          cursor: "grab",
        }}
      >
        <DragHandle />
      </IconButton>
    );
  }
};

const RemoveSegmentInputButton: React.FC<{
  segmentInputIdx: number;
  showDeleteButton: boolean;
  onDeleteClicked: () => void;
}> = ({ segmentInputIdx, showDeleteButton, onDeleteClicked }) => {
  if (!showDeleteButton) {
    return (
      // Dummy icon to maintain space for when we show icons
      <IconButton disabled sx={{ visibility: "hidden", p: 0 }}>
        <Clear />
      </IconButton>
    );
  } else {
    return (
      <IconButton
        data-testid={`segment-delete-${segmentInputIdx}`}
        sx={{
          p: 0,
          "&:hover": { backgroundColor: "inherit", boxShadow: "none" },
        }}
        onClick={onDeleteClicked}
      >
        <Clear />
      </IconButton>
    );
  }
};

interface AirlineInputProps {
  segmentInputIdx: number;
  value: string;
  error?: string;
  airlineOptions: AirlineOption[];
  onChange: (value: string) => void;
}

const AirlineInput: React.FC<AirlineInputProps> = ({
  segmentInputIdx,
  value,
  error,
  airlineOptions,
  onChange,
}) => {
  const selectedOption =
    airlineOptions.find((airline) => airline.iata === value) ?? airlineOptions[0];

  return (
    <Autocomplete
      data-testid={`segment-airline-${segmentInputIdx}`}
      disableClearable
      autoHighlight
      autoSelect
      options={airlineOptions}
      getOptionLabel={(airline) =>
        typeof airline === "string" ? airline : airline.airlineLabel || ""
      }
      value={selectedOption}
      groupBy={(option) => option.groupName}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === "object") {
          onChange(newValue.iata);
        }
      }}
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={Boolean(error)}
          helperText={
            <span data-testid={`segment-error-airline-${segmentInputIdx}`}>
              {error ? error : " "}
            </span>
          }
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
  dataTestId: string;
  errorTestId: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const AirportInput: React.FC<AirportInputProps> = ({
  dataTestId,
  errorTestId,
  label,
  value,
  error,
  onChange,
}) => {
  const [focused, setFocused] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const options = useMemo(() => searchAirports(value), [value]);

  return (
    <Autocomplete
      data-testid={dataTestId}
      freeSolo
      disableClearable
      autoHighlight
      options={options}
      filterOptions={(presetOptions) => presetOptions}
      inputValue={!focused || justSelected ? (value || "").toUpperCase() : value || ""}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === "input" || reason === "selectOption") {
          setJustSelected(reason === "selectOption");
          onChange(newInputValue.toLowerCase());
        }
      }}
      onChange={(_event, newValue) => {
        if (newValue && typeof newValue === "object") {
          setJustSelected(true);
          onChange((newValue as Airport).iata.toLowerCase());
        }
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.iata ? option.iata.toLowerCase() : ""
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const airport = option as Airport;
        return (
          <li key={key} {...optionProps} onMouseDown={(event) => event.preventDefault()}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
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
        popper: { placement: "bottom-start", style: { width: "fit-content" } },
        paper: {
          sx: { minWidth: { xs: 240, sm: 280 }, maxWidth: { xs: "calc(100vw - 32px)", sm: 400 } },
        },
      }}
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={Boolean(error)}
          helperText={<span data-testid={errorTestId}>{error ? error : " "}</span>}
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
