import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ClearIcon } from "@/components/common/icons";
import { buildRouteDisplayString } from "@/utils/routes";
import type { SavedCalculation } from "@/utils/recentCalculations";

export interface RecentCalculationSelectionProps {
  recentCalculations: SavedCalculation[];
  onRecentCalculationClick: (idx: number) => void;
  onRecentCalculationDeleteClick: (idx: number) => void;
  onClearAllClick: () => void;
}

export const RecentCalculationSelection: React.FC<RecentCalculationSelectionProps> = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalculationDeleteClick,
  onClearAllClick,
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        data-testid="recent-calculations-toggle"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-slate-700 hover:text-slate-900 cursor-pointer w-fit select-none"
      >
        <span>Recent Calculations</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1.5">
          <RecentCalculations
            recentCalculations={recentCalculations}
            onRecentCalculationClick={onRecentCalculationClick}
            onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
            onClearAllClick={onClearAllClick}
          />
        </div>
      )}
    </div>
  );
};

export interface RecentCalculationsProps {
  recentCalculations: SavedCalculation[];
  onRecentCalculationClick: (idx: number) => void;
  onRecentCalculationDeleteClick: (idx: number) => void;
  onClearAllClick: () => void;
}

export const RecentCalculations: React.FC<RecentCalculationsProps> = ({
  recentCalculations,
  onRecentCalculationClick,
  onRecentCalculationDeleteClick,
  onClearAllClick,
}) => {
  if (!recentCalculations || recentCalculations.length === 0) {
    return null;
  }

  const buildChipLabel = (recentCalculation: SavedCalculation) => {
    const tripType = recentCalculation.tripType === "one way" ? "o/w" : "r/t";
    const routeDisplayString = buildRouteDisplayString(recentCalculation.segmentInputs);
    return `${tripType} ${recentCalculation.eliteStatus} ${routeDisplayString}`;
  };

  const calcChips = recentCalculations.map((recentCalculation, idx) => {
    const label = buildChipLabel(recentCalculation);
    return (
      <div
        role="button"
        tabIndex={0}
        data-testid={`recent-calculation-chip-${idx}`}
        key={idx}
        onClick={() => onRecentCalculationClick(idx)}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onRecentCalculationClick(idx);
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 pl-3.5 pr-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-primary"
      >
        <span>{label}</span>
        <button
          type="button"
          aria-label={`Delete recent calculation ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRecentCalculationDeleteClick(idx);
          }}
          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-300 hover:text-slate-600 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-500 cursor-pointer"
        >
          <ClearIcon className="w-4 h-4" />
        </button>
      </div>
    );
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {calcChips}
      <ClearAllChip onClick={onClearAllClick} />
    </div>
  );
};

const ClearAllChip: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      type="button"
      data-testid="recent-calculations-clear-all"
      onClick={onClick}
      className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-1"
    >
      Clear All
    </button>
  );
};
