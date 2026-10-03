"use client";

import React, { useState } from "react";
import { SegmentedToggle, type ToggleOption } from "@/components/common/segmentedToggle";
import type {
  AtmosOptions,
  BookingType,
  EarnMethod,
  TicketIssuer,
} from "@/calculators/alaska/options";

const EARN_METHOD_OPTIONS: ToggleOption<EarnMethod>[] = [
  { value: "distance", label: "Distance" },
  { value: "price", label: "Price Paid" },
  { value: "segments", label: "Segments" },
];

const BOOKING_TYPE_OPTIONS: ToggleOption<BookingType>[] = [
  { value: "cash", label: "Cash" },
  { value: "award", label: "Award" },
];

const ISSUER_OPTIONS: { value: TicketIssuer; label: string }[] = [
  { value: "alaska", label: "Alaska / Hawaiian (027)" },
  { value: "american", label: "American Airlines (001)" },
  { value: "other", label: "Another partner airline" },
];

const FIELD_CLASS =
  "w-full rounded-md border border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-xs focus:outline-hidden";

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
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-xs font-medium text-slate-600">
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

export interface TicketOptionsProps {
  options: AtmosOptions;
  errors: Record<string, string>;
  onChange: (updates: Partial<AtmosOptions>) => void;
}

export const TicketOptions: React.FC<TicketOptionsProps> = ({ options, errors, onChange }) => {
  const isPrice = options.earnMethod === "price";
  const isCash = options.bookingType === "cash";

  return (
    <section aria-label="Ticket details" className="flex flex-col gap-3 pt-3 sm:pt-0 sm:pb-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-start">
        <SegmentedToggle
          ariaLabel="Earning method"
          testIdPrefix="earn-method"
          options={EARN_METHOD_OPTIONS}
          value={options.earnMethod}
          onChange={(earnMethod) => onChange({ earnMethod })}
        />
        <SegmentedToggle
          ariaLabel="Booking type"
          testIdPrefix="booking-type"
          options={BOOKING_TYPE_OPTIONS}
          value={options.bookingType}
          onChange={(bookingType) => onChange({ bookingType })}
        />
      </div>

      {isPrice && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isCash && (
            <div className="flex flex-col">
              <label htmlFor="ticket-issuer" className="mb-1 text-xs font-medium text-slate-600">
                Ticket issued by
              </label>
              <select
                id="ticket-issuer"
                data-testid="ticket-issuer-select"
                value={options.ticketIssuer}
                onChange={(e) => onChange({ ticketIssuer: e.target.value as TicketIssuer })}
                className={FIELD_CLASS}
              >
                {ISSUER_OPTIONS.map((issuer) => (
                  <option key={issuer.value} value={issuer.value}>
                    {issuer.label}
                  </option>
                ))}
              </select>
              <span className="mt-0.5 text-xs text-slate-500">
                Ticket numbers starting 027 are Alaska/Hawaiian; 001 is American.
              </span>
            </div>
          )}
          {isCash ? (
            <NumberField
              id="fare-usd-input"
              label="Fare paid (USD)"
              hint="Excluding taxes and fees, including carrier surcharges"
              value={options.fareUsd}
              error={errors.fareUsd}
              step="0.01"
              onChange={(fareUsd) => onChange({ fareUsd })}
            />
          ) : (
            <NumberField
              id="points-redeemed-input"
              label="Points redeemed"
              hint="1 status point for every 20 points redeemed"
              value={options.pointsRedeemed}
              error={errors.pointsRedeemed}
              step="1"
              onChange={(pointsRedeemed) => onChange({ pointsRedeemed })}
            />
          )}
        </div>
      )}

      <label className="inline-flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          data-testid="global-locals-checkbox"
          checked={options.globalLocals}
          onChange={(e) => onChange({ globalLocals: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span>
          Global Locals member
          <span className="block text-xs text-slate-500">
            +10% status points on flights that begin or end outside the United States
          </span>
        </span>
      </label>
    </section>
  );
};
