"use client";

import React from "react";
import { atmosProgram } from "@/calculators/atmos";
import { toAtmosOptions } from "@/calculators/atmos/options";
import { AtmosSegmentResults } from "@/components/atmos/segmentResults";
import {
  BookingTypeToggle,
  CommunityInput,
  EarnMethodInput,
  PricePaidOptions,
} from "@/components/atmos/ticketOptions";
import { RecentCalculationSelection } from "@/components/common/recentCalculations";
import { SegmentedToggle, TRIP_TYPE_OPTIONS } from "@/components/common/segmentedToggle";
import { CancelIcon, SpinnerIcon } from "@/components/common/icons";
import { SegmentInputList } from "@/components/form/segmentInput";
import { EliteStatusInput } from "@/components/qantas/input";
import { ResultsSummary } from "@/components/qantas/resultsSummary";
import { useCalculator } from "@/hooks/useCalculator";

const ELITE_STATUS_NAMES = atmosProgram.eliteTiers.map((tier) => tier.name);

export const AtmosCalculator: React.FC = () => {
  const {
    segmentInputs,
    inputErrors,
    optionErrors,
    eliteStatus,
    tripType,
    programOptions,
    isCalculating,
    calculationOutput,
    savedCalculations,
    setEliteStatus,
    setTripType,
    setProgramOptions,
    addSegment,
    deleteSegment,
    updateSegment,
    reorderSegments,
    calculate,
    loadRecentCalculation,
    deleteRecentCalculation,
    clearAllRecentCalculations,
  } = useCalculator({ program: atmosProgram });
  const atmosOptions = toAtmosOptions(programOptions);

  return (
    <div className="w-full min-w-0 mt-4">
      <div className="w-full sm:rounded-xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white p-0 sm:p-4 shadow-none sm:shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3 pb-0 sm:pb-3">
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
            <SegmentedToggle
              testId="trip-type-toggle"
              ariaLabel="Trip type selection"
              options={TRIP_TYPE_OPTIONS}
              value={tripType}
              onChange={setTripType}
            />
            <BookingTypeToggle
              value={atmosOptions.bookingType}
              onChange={(bookingType) => setProgramOptions({ bookingType })}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-2.5 sm:gap-3">
            <EarnMethodInput
              value={atmosOptions.earnMethod}
              onChange={(earnMethod) => setProgramOptions({ earnMethod })}
            />
            <EliteStatusInput
              eliteStatus={eliteStatus}
              options={ELITE_STATUS_NAMES}
              onChange={setEliteStatus}
            />
          </div>
        </div>

        <PricePaidOptions
          options={atmosOptions}
          errors={optionErrors}
          onChange={setProgramOptions}
        />

        <div className="pt-2 sm:pt-4">
          <SegmentInputList
            segmentInputs={segmentInputs}
            errors={inputErrors}
            adapter={atmosProgram.segmentInputAdapter}
            airlineOptions={atmosProgram.airlineOptions}
            programOptions={programOptions}
            onDeleteSegmentPressed={deleteSegment}
            onSegmentInputChanged={updateSegment}
            onSegmentsReordered={reorderSegments}
          />

          <div className="mt-1">
            <CommunityInput
              value={atmosOptions.community}
              onChange={(community) => setProgramOptions({ community })}
            />
          </div>

          <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
            <div className="flex justify-start">
              <button
                type="button"
                data-testid="add-segment-button"
                onClick={addSegment}
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer transition-colors"
              >
                Add Segment
              </button>
            </div>
            <div className="flex justify-end sm:justify-center">
              <button
                type="button"
                data-testid="calculate-button"
                onClick={calculate}
                disabled={isCalculating}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-hover focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isCalculating && <SpinnerIcon className="w-5 h-5 text-white animate-spin" />}
                <span>Calculate</span>
              </button>
            </div>
          </div>
        </div>

        {savedCalculations.length > 0 && (
          <div className="mt-6 sm:mt-8 pb-4">
            <RecentCalculationSelection
              recentCalculations={savedCalculations}
              onRecentCalculationClick={loadRecentCalculation}
              onRecentCalculationDeleteClick={deleteRecentCalculation}
              onClearAllClick={clearAllRecentCalculations}
            />
          </div>
        )}
      </div>

      {calculationOutput && (
        <div className="mt-6 flex flex-col items-center w-full min-w-0 gap-4">
          <ResultsSummary
            calculationOutput={calculationOutput}
            compareWithQantasCalc={false}
            isCalculating={isCalculating}
            currencies={atmosProgram.currencies}
          />
          {calculationOutput.containsErrors && (
            <div
              role="alert"
              className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs flex items-center gap-3"
            >
              <CancelIcon className="w-5 h-5 text-red-600 shrink-0" />
              <span>There are errors in the calculation. See the details below.</span>
            </div>
          )}
          <AtmosSegmentResults calculatedData={calculationOutput} />
        </div>
      )}
    </div>
  );
};
