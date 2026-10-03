import React from "react";

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  testId?: string;
  ariaLabel?: string;
}

export interface SegmentedToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  testId?: string;
  testIdPrefix?: string;
}

export const TRIP_TYPE_OPTIONS: ToggleOption<string>[] = [
  { value: "one way", label: "One Way", testId: "trip-type-oneway", ariaLabel: "One way flight" },
  { value: "return", label: "Return", testId: "trip-type-return", ariaLabel: "Return flight" },
];

export const SegmentedToggle = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  testId,
  testIdPrefix,
}: SegmentedToggleProps<T>) => {
  return (
    <div
      data-testid={testId}
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-testid={
            option.testId ?? (testIdPrefix ? `${testIdPrefix}-${option.value}` : undefined)
          }
          aria-label={option.ariaLabel}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            value === option.value
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
