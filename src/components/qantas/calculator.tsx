"use client";

import React, { useState } from "react";
import { JAL_AIRLINES, JETSTAR_AIRLINES } from "@/calculators/qantas/constants";
import { EliteStatusInput } from "@/components/qantas/input";
import { RecentCalculationSelection } from "@/components/qantas/recentCalculations";
import { AdvancedInput } from "@/components/form/advancedInput";
import { ResultsSummary } from "@/components/qantas/resultsSummary";
import { SegmentResults } from "@/components/qantas/segmentResults";
import { qantasProgram } from "@/calculators/qantas";
import { SegmentInputList } from "@/components/form/segmentInput";
import { useCalculator } from "@/hooks/useCalculator";
import { Dialog } from "@/components/common/dialog";
import { CancelIcon, InfoIcon, SpinnerIcon } from "@/components/common/icons";
import type { CalculationResult } from "@/types/calculator";

const FLAG_ENABLE_QANTAS_API = true;

const QantasApiDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  return (
    <Dialog onClose={onClose} open={open} title="Compare with Qantas">
      <div className="flex flex-col gap-2">
        <p>This enables us to compare our results with Qantas&apos;s website calculator results.</p>
        <p>This makes an API call to Qantas&apos;s website, and as a result, can be slow.</p>
      </div>
    </Dialog>
  );
};

const CompareWithQantasAPISwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`flex items-center justify-center sm:justify-end gap-2 ${
        FLAG_ENABLE_QANTAS_API ? "" : "invisible"
      }`}
    >
      <button
        type="button"
        role="switch"
        data-testid="compare-with-qantas-switch"
        aria-label="Compare with Qantas website calculator"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary ${
          checked ? "bg-primary" : "bg-slate-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs text-slate-700 leading-tight select-none">
        Compare With
        <br />
        Qantas&apos;s Calculator
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Learn more about comparing with Qantas calculator"
        className="p-1 text-slate-400 hover:text-slate-600 rounded-full focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
      >
        <InfoIcon className="w-5 h-5 text-slate-500 hover:text-slate-700" />
      </button>
      <QantasApiDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

const ErrorDisplay: React.FC<{ calculationOutput: CalculationResult | null }> = ({
  calculationOutput,
}) => {
  if (!calculationOutput || !calculationOutput.containsErrors) {
    return null;
  }

  return (
    <div
      role="alert"
      className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs flex items-center gap-3"
    >
      <CancelIcon className="w-5 h-5 text-red-600 shrink-0" />
      <span>There are errors in the calculation. See the details below.</span>
    </div>
  );
};

const InfoDisplay: React.FC<{ calculationOutput: CalculationResult | null }> = ({
  calculationOutput,
}) => {
  if (!calculationOutput) {
    return null;
  }

  const infoAlerts: React.ReactNode[] = [];

  const jetstarResults = calculationOutput.segmentResults.filter((segmentResult) => {
    return JETSTAR_AIRLINES.has(segmentResult.segment.airline);
  });
  const jetstarDiscountEconomyResults = jetstarResults.filter((jetstarResult) => {
    return jetstarResult.fareEarnCategory === "discountEconomy";
  });
  const jalResults = calculationOutput.segmentResults.filter((segmentResult) => {
    return JAL_AIRLINES.has(segmentResult.segment.airline);
  });

  if (jetstarResults.length !== 0) {
    infoAlerts.push(
      <div
        role="alert"
        key="jetstar-alerts"
        className="w-full max-w-2xl rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 shadow-xs flex items-start gap-3"
      >
        <InfoIcon className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          {jetstarDiscountEconomyResults.length > 0 && (
            <p>
              If you are travelling on a domestic Jetstar flight within New Zealand that connects to
              an international Jetstar flight, you will not earn Qantas Points or Status Credits
              unless you purchase an Economy Starter Plus, Flex, Flex Plus, Economy Starter Max or
              Business Max fare with Jetstar.
            </p>
          )}
          <p>
            Qantas Points and Status Credits are not earned when travelling in the Economy Cabin on
            flights with a Jetstar (JQ) or Jetstar Japan (GK) flight number as part of a Qantas
            International fare or when a Jetstar flight voucher has been selected in lieu of Points
            and Status Credits.
          </p>
        </div>
      </div>
    );
  }

  if (jalResults.length !== 0) {
    infoAlerts.push(
      <div
        role="alert"
        key="jal-alerts"
        className="w-full max-w-2xl rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 shadow-xs flex items-start gap-3"
      >
        <InfoIcon className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <p>
          Japan Airlines flights within Japan are awarded points based on information provided by
          Japan Airlines. Qantas does not define the earning rules for these flights
        </p>
      </div>
    );
  }

  if (infoAlerts.length === 0) {
    return null;
  }
  return <div className="w-full max-w-2xl flex flex-col gap-3">{infoAlerts}</div>;
};

export const QantasCalculator: React.FC = () => {
  const {
    segmentInputs,
    inputErrors,
    eliteStatus,
    tripType,
    compareWithProgramApi: compareWithQantasCalc,
    isCalculating,
    calculationOutput,
    savedCalculations,
    setEliteStatus,
    setTripType,
    setCompareWithProgramApi: setCompareWithQantasCalc,
    addSegment,
    deleteSegment,
    updateSegment,
    reorderSegments,
    setAllSegmentInputs,
    calculate,
    loadRecentCalculation,
    deleteRecentCalculation,
    clearAllRecentCalculations,
  } = useCalculator({ program: qantasProgram });

  return (
    <div className="w-full min-w-0 mt-4">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
        {/* Top row: Trip type toggle & Elite status */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3 pb-0 sm:pb-3">
          <div className="flex justify-center sm:justify-start">
            <div
              data-testid="trip-type-toggle"
              role="group"
              aria-label="Trip type selection"
              className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100"
            >
              <button
                type="button"
                data-testid="trip-type-oneway"
                aria-label="One way flight"
                aria-pressed={tripType === "one way"}
                onClick={() => setTripType("one way")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  tripType === "one way"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                data-testid="trip-type-return"
                aria-label="Return flight"
                aria-pressed={tripType === "return"}
                onClick={() => setTripType("return")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  tripType === "return"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Return
              </button>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <EliteStatusInput
              eliteStatus={eliteStatus}
              onChange={(value) => setEliteStatus(value)}
            />
          </div>
        </div>

        {/* Segments list and actions */}
        <div className="pt-2 sm:pt-4">
          <SegmentInputList
            segmentInputs={segmentInputs}
            errors={inputErrors}
            adapter={qantasProgram.segmentInputAdapter}
            airlineOptions={qantasProgram.airlineOptions}
            onDeleteSegmentPressed={deleteSegment}
            onSegmentInputChanged={updateSegment}
            onSegmentsReordered={reorderSegments}
          />

          {/* Action buttons and controls row */}
          <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
            <div className="flex justify-start order-1">
              <button
                type="button"
                data-testid="add-segment-button"
                onClick={addSegment}
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer transition-colors"
              >
                Add Segment
              </button>
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-center order-3 sm:order-2 mt-1 sm:mt-0">
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

            <div className="flex justify-end order-2 sm:order-3">
              <CompareWithQantasAPISwitch
                checked={compareWithQantasCalc}
                onChange={setCompareWithQantasCalc}
              />
            </div>
          </div>
        </div>

        {/* Saved calculations */}
        {savedCalculations && savedCalculations.length > 0 && (
          <div className="mt-6 sm:mt-8 pb-4">
            <RecentCalculationSelection
              recentCalculations={savedCalculations}
              onRecentCalculationClick={loadRecentCalculation}
              onRecentCalculationDeleteClick={deleteRecentCalculation}
              onClearAllClick={clearAllRecentCalculations}
            />
          </div>
        )}

        <div
          className={
            savedCalculations && savedCalculations.length > 0 ? "pt-0 pb-2" : "mt-6 sm:mt-8 pb-2"
          }
        >
          <AdvancedInput setSegmentInputs={setAllSegmentInputs} />
        </div>
      </div>

      {/* Calculation results */}
      {calculationOutput && (
        <div className="mt-6 flex flex-col items-center w-full min-w-0 gap-4">
          <ResultsSummary
            calculationOutput={calculationOutput}
            compareWithQantasCalc={compareWithQantasCalc}
            isCalculating={isCalculating}
          />
          <ErrorDisplay calculationOutput={calculationOutput} />
          <InfoDisplay calculationOutput={calculationOutput} />
          <SegmentResults
            calculatedData={calculationOutput}
            compareWithQantasCalc={compareWithQantasCalc}
          />
        </div>
      )}
    </div>
  );
};
