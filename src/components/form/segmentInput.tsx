import React, { useMemo } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
} from "@hello-pangea/dnd";
import { Combobox } from "@/components/common/combobox";
import { ClearIcon, DragHandleIcon } from "@/components/common/icons";
import { buildAirlineOptions } from "@/constants/airlines";
import { searchAirports } from "@/utils/airports";
import { validate } from "@/utils/segmentValidation";
import type { SegmentInput } from "@/models/segmentInput";
import type {
  AirlineOption,
  FareClassInputRenderProps,
  SegmentErrors,
  SegmentInputAdapter,
} from "@/types/segmentInput";

export type { AirlineOption, FareClassInputRenderProps, SegmentErrors, SegmentInputAdapter };
export { buildAirlineOptions, validate };

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
    <Combobox
      dataTestId={`segment-fare-class-${segmentInputIdx}`}
      errorTestId={`segment-error-fare-class-${segmentInputIdx}`}
      label="Fare Class"
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={(opt) => displayLookup[opt] || opt}
      getOptionValue={(opt) => opt}
      groupBy={groupBy}
      error={error}
    />
  );
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
  const onDragEnd = (result: DropResult) => {
    if (result.destination && result.source.index !== result.destination.index) {
      onSegmentsReordered(result.source.index, result.destination.index);
    }
  };

  if (segmentInputs.length <= 1) {
    return (
      <div>
        {segmentInputs.map((segmentInput, segmentInputIdx) => (
          <SegmentInputListItem
            key={segmentInput.uuid}
            segmentInput={segmentInput}
            segmentInputIdx={segmentInputIdx}
            showDeleteButton={false}
            enableDrag={false}
            errors={errors[segmentInputIdx] || {}}
            airlineOptions={airlineOptions}
            onDeleteSegmentPressed={onDeleteSegmentPressed}
            onSegmentInputChanged={onSegmentInputChanged}
            adapter={adapter}
          />
        ))}
      </div>
    );
  }

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
  if (!enableDrag) {
    return (
      <div>
        {segmentInputIdx > 0 && <hr className="my-2.5 sm:my-1.5 border-slate-200 sm:invisible" />}
        <SegmentInputRow
          segmentInput={segmentInput}
          segmentInputIdx={segmentInputIdx}
          errors={errors}
          showDeleteButton={showDeleteButton}
          airlineOptions={airlineOptions}
          onDeleteClicked={() => onDeleteSegmentPressed(segmentInputIdx)}
          onChange={(newSegmentInput) => onSegmentInputChanged(segmentInputIdx, newSegmentInput)}
          adapter={adapter}
        />
      </div>
    );
  }

  return (
    <Draggable draggableId={segmentInput.uuid} index={segmentInputIdx} isDragDisabled={!enableDrag}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          {segmentInputIdx > 0 && <hr className="my-2.5 sm:my-1.5 border-slate-200 sm:invisible" />}
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
    onChange: (val) => onChange({ ...segmentInput, fareClass: val }),
  });

  return (
    <div
      data-testid={`segment-row-${segmentInputIdx}`}
      className="grid grid-cols-12 sm:grid-cols-[repeat(22,minmax(0,1fr))] sm:grid-cols-22 gap-2 items-start"
    >
      <div
        className="col-span-8 sm:col-span-1 order-1 sm:order-1 flex items-center justify-start sm:justify-center h-8 sm:h-[56px] sm:pt-6 gap-1"
        {...dragHandleProps}
      >
        <ReorderSegmentInputButton
          showReorderButton={showDeleteButton}
          segmentInputIdx={segmentInputIdx}
        />
        <span className="inline sm:hidden font-medium text-slate-500 text-sm">
          Segment {segmentInputIdx + 1}
        </span>
      </div>

      <div className="col-span-4 sm:col-span-1 order-2 sm:order-6 flex items-center justify-end sm:justify-center h-8 sm:h-[56px] sm:pt-6">
        <RemoveSegmentInputButton
          segmentInputIdx={segmentInputIdx}
          showDeleteButton={showDeleteButton}
          onDeleteClicked={onDeleteClicked}
        />
      </div>

      <div className="col-span-12 sm:col-span-6 order-3 sm:order-2">
        <AirlineInput
          segmentInputIdx={segmentInputIdx}
          value={segmentInput.airline}
          error={errors["airline"]}
          airlineOptions={airlineOptions}
          onChange={(value) => {
            const shouldClear =
              adapter?.shouldClearFareClassOnAirlineChange?.(segmentInput, value) ?? false;
            onChange({
              ...segmentInput,
              airline: value,
              ...(shouldClear ? { fareClass: "" } : {}),
            });
          }}
        />
      </div>

      <div className="col-span-6 sm:col-span-4 order-4 sm:order-3">
        <AirportInput
          dataTestId={`segment-from-${segmentInputIdx}`}
          errorTestId={`segment-error-from-${segmentInputIdx}`}
          label="From (e.g. syd)"
          value={segmentInput.fromAirportText}
          error={errors["fromAirportText"]}
          onChange={(value) => {
            const shouldClear =
              adapter?.shouldClearFareClassOnAirportChange?.(segmentInput, "from", value) ?? false;
            onChange({
              ...segmentInput,
              fromAirportText: value,
              ...(shouldClear ? { fareClass: "" } : {}),
            });
          }}
        />
      </div>

      <div className="col-span-6 sm:col-span-4 order-5 sm:order-4">
        <AirportInput
          dataTestId={`segment-to-${segmentInputIdx}`}
          errorTestId={`segment-error-to-${segmentInputIdx}`}
          label="To (e.g. mel)"
          value={segmentInput.toAirportText}
          error={errors["toAirportText"]}
          onChange={(value) => {
            const shouldClear =
              adapter?.shouldClearFareClassOnAirportChange?.(segmentInput, "to", value) ?? false;
            onChange({
              ...segmentInput,
              toAirportText: value,
              ...(shouldClear ? { fareClass: "" } : {}),
            });
          }}
        />
      </div>

      <div className="col-span-12 sm:col-span-6 order-6 sm:order-5">
        {customFareClassInput != null ? (
          customFareClassInput
        ) : (
          <div
            data-testid={`segment-fare-class-${segmentInputIdx}`}
            className="w-full flex flex-col"
          >
            <label
              htmlFor={`fare-class-input-${segmentInputIdx}`}
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Fare Class (e.g. &quot;y&quot; or &quot;i&quot;)
            </label>
            <input
              id={`fare-class-input-${segmentInputIdx}`}
              type="text"
              value={segmentInput.fareClass}
              onChange={(e) =>
                onChange({
                  ...segmentInput,
                  fareClass: e.target.value?.trim()?.toLowerCase(),
                })
              }
              className={`w-full rounded-md border ${
                errors["fareClass"] ? "border-red-500" : "border-slate-300"
              } bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary`}
            />
            <span
              data-testid={`segment-error-fare-class-${segmentInputIdx}`}
              className="mt-1 min-h-[16px] text-xs text-red-600"
            >
              {errors["fareClass"] ? errors["fareClass"] : " "}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ReorderSegmentInputButton: React.FC<{
  showReorderButton: boolean;
  segmentInputIdx: number;
}> = ({ showReorderButton, segmentInputIdx }) => {
  if (!showReorderButton) {
    return (
      <button
        type="button"
        disabled
        className="invisible p-0 text-slate-400"
        aria-hidden="true"
        tabIndex={-1}
      >
        <DragHandleIcon className="w-5 h-5" />
      </button>
    );
  } else {
    return (
      <button
        type="button"
        className="cursor-grab p-0 text-slate-500 hover:text-slate-700 active:cursor-grabbing focus:outline-hidden"
        aria-label={`Reorder segment ${segmentInputIdx + 1}`}
      >
        <DragHandleIcon className="w-5 h-5" />
      </button>
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
      <button
        type="button"
        disabled
        className="invisible p-0 text-slate-400"
        aria-hidden="true"
        tabIndex={-1}
      >
        <ClearIcon className="w-5 h-5" />
      </button>
    );
  } else {
    return (
      <button
        type="button"
        data-testid={`segment-delete-${segmentInputIdx}`}
        onClick={onDeleteClicked}
        className="cursor-pointer p-0 text-slate-400 hover:text-slate-600 focus:outline-hidden"
        aria-label={`Remove segment ${segmentInputIdx + 1}`}
      >
        <ClearIcon className="w-5 h-5" />
      </button>
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
  return (
    <Combobox
      dataTestId={`segment-airline-${segmentInputIdx}`}
      errorTestId={`segment-error-airline-${segmentInputIdx}`}
      label="Airline"
      options={airlineOptions}
      value={value}
      getOptionValue={(airline) => airline.iata}
      getOptionLabel={(airline) => airline.airlineLabel}
      groupBy={(airline) => airline.groupName}
      error={error}
      onChange={onChange}
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
  const options = useMemo(() => searchAirports(value), [value]);

  return (
    <Combobox
      dataTestId={dataTestId}
      errorTestId={errorTestId}
      label={label}
      options={options}
      value={value}
      freeSolo
      filterOptions={false}
      formatDisplayValue={(val) => val.toUpperCase()}
      getOptionValue={(airport) => airport.iata.toLowerCase()}
      getOptionLabel={(airport) => airport.iata.toUpperCase()}
      renderOption={(option) => {
        if (typeof option === "string") return option;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              {option.iata.toUpperCase()} — {option.name}
            </span>
            <span className="text-xs text-slate-500">
              {option.city}, {option.country}
            </span>
          </div>
        );
      }}
      error={error}
      onChange={onChange}
    />
  );
};
