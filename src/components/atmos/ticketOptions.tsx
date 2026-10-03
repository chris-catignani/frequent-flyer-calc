"use client";

import React, { useState } from "react";
import { Combobox } from "@/components/common/combobox";
import { SegmentedToggle, type ToggleOption } from "@/components/common/segmentedToggle";
import { COMMUNITY_DISPLAY } from "@/calculators/atmos/constants";
import {
  COMMUNITIES,
  type AtmosOptions,
  type BookingType,
  type Community,
  type EarnMethod,
  type TicketIssuer,
} from "@/calculators/atmos/options";

const EARN_METHOD_OPTIONS: { value: EarnMethod; label: string }[] = [
  { value: "distance", label: "Distance traveled" },
  { value: "price", label: "Price paid" },
  { value: "segments", label: "Segments flown" },
];

const BOOKING_TYPE_OPTIONS: ToggleOption<BookingType>[] = [
  { value: "cash", label: "Cash" },
  { value: "award", label: "Award" },
];

const ISSUER_OPTIONS: { value: TicketIssuer; label: string }[] = [
  { value: "alaska", label: "Alaska (027)" },
  { value: "american", label: "American (001)" },
  { value: "other", label: "Another partner" },
];

const FIELD_CLASS =
  "w-full rounded-md border border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary bg-white px-3.5 py-3 text-base text-slate-900 shadow-xs focus:outline-hidden";

interface NumberFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: number;
  error?: string;
  step: string;
  onChange: (value: number) => void;
}

// Keeps its own text so partial input like "48." isn't rewritten while typing
const NumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  hint,
  value,
  error,
  step,
  onChange,
}) => {
  const [text, setText] = useState(value ? String(value) : "");

  const [prevValue, setPrevValue] = useState(value);
  // Resync when the value changes externally (e.g. loading a recent calculation)
  if (prevValue !== value) {
    setPrevValue(value);
    if (Number(text || 0) !== value) setText(value ? String(value) : "");
  }

  return (
    <div className="relative flex flex-col pt-1.5">
      <label
        htmlFor={id}
        className="absolute top-1.5 -translate-y-1/2 left-2.5 z-10 px-1 text-xs font-medium bg-white leading-none text-slate-500"
      >
        {label}
      </label>
      <input
        id={id}
        data-testid={id}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={text}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = Number(e.target.value);
          onChange(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
        }}
        className={`${FIELD_CLASS} ${error ? "border-red-500" : ""}`}
      />
      {hint && (
        <span id={`${id}-hint`} className="mt-0.5 text-xs text-slate-500">
          {hint}
        </span>
      )}
      <span data-testid={`${id}-error`} className="mt-0.5 min-h-[16px] text-xs text-red-600">
        {error ?? ""}
      </span>
    </div>
  );
};

export const EarnMethodInput: React.FC<{
  value: EarnMethod;
  onChange: (earnMethod: EarnMethod) => void;
}> = ({ value, onChange }) => {
  return (
    <div data-testid="earn-method-input" className="w-full">
      <Combobox
        label="Earn By"
        options={EARN_METHOD_OPTIONS}
        value={value}
        onChange={(earnMethod) => onChange(earnMethod as EarnMethod)}
        getOptionLabel={(opt) => opt.label}
        getOptionValue={(opt) => opt.value}
        dropdownClassName="left-0 w-full min-w-full sm:min-w-[200px]"
      />
    </div>
  );
};

export const BookingTypeToggle: React.FC<{
  value: BookingType;
  onChange: (bookingType: BookingType) => void;
}> = ({ value, onChange }) => {
  return (
    <SegmentedToggle
      ariaLabel="Booking type"
      testIdPrefix="booking-type"
      options={BOOKING_TYPE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
};

const NO_FLIGHT_BONUS_HINT = "No bonus on flight earnings";

const COMMUNITY_HINTS: Record<Community, string> = {
  none: "",
  globalLocals: "+10% status points on flights that begin or end outside the United States",
  huakai: "+50% Atmos Points and status points on flights between the Hawaiian Islands",
  club49: NO_FLIGHT_BONUS_HINT,
  culinaryJourneys: NO_FLIGHT_BONUS_HINT,
  activeEscapes: NO_FLIGHT_BONUS_HINT,
  familiesOnTheGo: NO_FLIGHT_BONUS_HINT,
};

export const CommunityInput: React.FC<{
  value: Community;
  onChange: (community: Community) => void;
}> = ({ value, onChange }) => {
  return (
    <div data-testid="community-input" className="w-full">
      <Combobox
        label="Atmos Community"
        options={[...COMMUNITIES]}
        value={value}
        onChange={(community) => onChange(community as Community)}
        getOptionLabel={(community) => COMMUNITY_DISPLAY[community]}
        getOptionValue={(community) => community}
        dropdownClassName="left-0 w-full min-w-full sm:min-w-[220px]"
      />
      {COMMUNITY_HINTS[value] && (
        <span className="mt-0.5 block text-xs text-slate-500">{COMMUNITY_HINTS[value]}</span>
      )}
    </div>
  );
};

export interface PricePaidOptionsProps {
  options: AtmosOptions;
  errors: Record<string, string>;
  onChange: (updates: Partial<AtmosOptions>) => void;
}

/** Issuer and fare / points-redeemed fields, laid out by the parent grid; only rendered for the price-paid earning method */
export const PricePaidOptions: React.FC<PricePaidOptionsProps> = ({
  options,
  errors,
  onChange,
}) => {
  if (options.earnMethod !== "price") {
    return null;
  }
  const isCash = options.bookingType === "cash";

  return (
    <>
      {isCash && (
        <div data-testid="ticket-issuer-input" className="w-full">
          <Combobox
            label="Ticket issued by"
            options={ISSUER_OPTIONS}
            value={options.ticketIssuer}
            onChange={(ticketIssuer) => onChange({ ticketIssuer: ticketIssuer as TicketIssuer })}
            getOptionLabel={(opt) => opt.label}
            getOptionValue={(opt) => opt.value}
            dropdownClassName="left-0 w-full min-w-full sm:min-w-[240px]"
          />
          <span className="mt-0.5 block text-xs text-slate-500">
            Ticket numbers starting 027 are Alaska or Hawaiian; 001 is American.
          </span>
        </div>
      )}
      {isCash ? (
        options.ticketIssuer !== "other" && (
          <NumberField
            key="fare-usd-input"
            id="fare-usd-input"
            label="Fare paid (USD)"
            hint="Excluding taxes and fees, including carrier surcharges"
            value={options.fareUsd}
            error={errors.fareUsd}
            step="0.01"
            onChange={(fareUsd) => onChange({ fareUsd })}
          />
        )
      ) : (
        <NumberField
          key="points-redeemed-input"
          id="points-redeemed-input"
          label="Points redeemed"
          hint="1 status point for every 20 points redeemed"
          value={options.pointsRedeemed}
          error={errors.pointsRedeemed}
          step="1"
          onChange={(pointsRedeemed) => onChange({ pointsRedeemed })}
        />
      )}
    </>
  );
};
