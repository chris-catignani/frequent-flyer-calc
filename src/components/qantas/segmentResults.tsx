import React, { useState } from "react";
import {
  EARN_CATEGORY_DISPLAY,
  EARN_CATEGORY_URLS,
  QANTAS_FARE_CLASS_DISPLAY,
} from "@/calculators/qantas/constants";
import { ALL_AIRLINES } from "@/constants/airlines";
import { isAirlinePointsMatch, isElitePointsMatch, isClosePointsMatch } from "@/utils/comparison";
import type { CalculationResult, SegmentResult } from "@/types/calculator";
import { Dialog } from "@/components/common/dialog";
import {
  CheckCircleIcon,
  CancelIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/common/icons";

export interface SegmentResultsProps {
  calculatedData?: CalculationResult | null;
  compareWithQantasCalc: boolean;
}

export const SegmentResults: React.FC<SegmentResultsProps> = ({
  calculatedData,
  compareWithQantasCalc,
}) => {
  if (!calculatedData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-w-0 max-w-full sm:max-w-2xl mx-auto mt-6">
      <div
        data-testid="segment-results-table"
        className="w-full min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs"
      >
        <table className="w-full text-sm text-left">
          <thead>
            <SegmentTableHeader compareWithQantasCalc={compareWithQantasCalc} />
          </thead>
          <tbody className="divide-y divide-slate-200">
            {calculatedData.segmentResults.map((segmentResult, segmentIdx) => (
              <SegmentTableRow
                key={segmentIdx}
                segmentIdx={segmentIdx}
                segmentResult={segmentResult}
                compareWithQantasCalc={compareWithQantasCalc}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SegmentTableHeader: React.FC<{ compareWithQantasCalc: boolean }> = ({
  compareWithQantasCalc,
}) => {
  return (
    <tr className="border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">
      <th scope="col" className="px-3.5 py-3.5 sm:px-4 text-left">
        Segment Route
      </th>
      <th scope="col" className="px-3.5 py-3.5 sm:px-4 text-right whitespace-nowrap">
        Qantas Points
      </th>
      <th scope="col" className="px-3.5 py-3.5 sm:px-4 text-right whitespace-nowrap">
        Status Credits
      </th>
      {compareWithQantasCalc && (
        <th scope="col" className="px-3.5 py-3.5 sm:px-4 text-right whitespace-nowrap">
          Matches Qantas
        </th>
      )}
      <th scope="col" aria-label="Details" className="px-1.5 py-3.5 sm:px-2 w-10" />
    </tr>
  );
};

const getFareClassDisplay = (fareClass: string): string => {
  if (fareClass.length === 1) {
    return fareClass;
  } else if (fareClass in QANTAS_FARE_CLASS_DISPLAY) {
    return QANTAS_FARE_CLASS_DISPLAY[fareClass];
  } else {
    return fareClass;
  }
};

const AirlinePointsBreakdownDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  segmentResult: SegmentResult;
}> = ({ open, onClose, segmentResult }) => {
  const { airlinePointsBreakdown: { basePoints, eliteBonus, minPoints, totalEarned } = {} } =
    segmentResult;
  return (
    <Dialog open={open} onClose={onClose} title="Points Calculation Breakdown">
      <div className="flex flex-col items-center justify-center pb-2 text-center text-slate-700">
        <p className="mb-3 font-semibold underline text-slate-900">
          Total Points: {totalEarned?.toLocaleString()}
        </p>
        <p className="leading-tight">Base Points: {basePoints?.toLocaleString()}</p>
        <p className="leading-tight">+</p>
        <p className="leading-tight">
          Elite Bonus: {eliteBonus?.airlinePoints?.toLocaleString() || "n/a"}
        </p>
        <p className="my-2">- or -</p>
        <p>Min Points: {minPoints?.toLocaleString() || "n/a"}</p>
      </div>
    </Dialog>
  );
};

const AirlinePointsDisplay: React.FC<{ segmentResult: SegmentResult }> = ({ segmentResult }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="inline-flex items-center justify-end gap-1">
      <span>{segmentResult.airlinePoints?.toLocaleString()}</span>
      <button
        type="button"
        className="inline-flex items-center justify-center p-0.5 rounded-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 focus:outline-hidden cursor-pointer"
        onClick={handleClickOpen}
        aria-label="View points calculation breakdown"
      >
        <InfoIcon className="w-4 h-4" />
      </button>
      <AirlinePointsBreakdownDialog
        open={open}
        onClose={handleClose}
        segmentResult={segmentResult}
      />
    </div>
  );
};

const MatchesQantasSegmentErrorDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  error: Error | { message?: string };
}> = ({ open, onClose, error }) => {
  return (
    <Dialog open={open} onClose={onClose} title="Qantas Calculator failed to calculate segment">
      <div className="flex flex-col gap-2 text-slate-700">
        <p>{error.message}</p>
      </div>
    </Dialog>
  );
};

const MatchesQantasSegmentMisMatchDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  segmentResult: SegmentResult;
}> = ({ open, onClose, segmentResult }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Qantas Calculator results do not match our results for this segment"
    >
      <div className="flex flex-col gap-1 text-slate-700">
        <p className="font-medium text-slate-900">Our Results:</p>
        <p>Qantas Points: {segmentResult.airlinePoints}</p>
        <p>Status Credits: {segmentResult.elitePoints}</p>
        <p className="mt-2 font-medium text-slate-900">Qantas Calculator Results:</p>
        <p>Qantas Points: {segmentResult.qantasAPIResults?.qantasData?.airlinePoints}</p>
        <p>Status Credits: {segmentResult.qantasAPIResults?.qantasData?.elitePoints}</p>
      </div>
    </Dialog>
  );
};

const MatchesQantasSegmentIcon: React.FC<{
  segmentResult: SegmentResult;
  qantasAPIError?: Error | { message?: string } | null;
  matchesAirlinePoints: boolean;
  matchesElitePoints: boolean;
}> = ({ segmentResult, qantasAPIError, matchesAirlinePoints, matchesElitePoints }) => {
  if (!segmentResult.qantasAPIResults) {
    return null;
  }

  const qantasAirlinePoints = segmentResult.qantasAPIResults?.qantasData?.airlinePoints;
  const isCloseMatch =
    matchesAirlinePoints &&
    matchesElitePoints &&
    qantasAirlinePoints !== undefined &&
    isClosePointsMatch(segmentResult.airlinePoints ?? 0, qantasAirlinePoints);

  const matchTooltip = isCloseMatch
    ? "Matches Qantas Calculator (within 1 point difference due to rounding)"
    : "Matches Qantas Calculator";

  if (qantasAPIError) {
    return (
      <button
        type="button"
        title="Qantas Calculator Failed to Calculate"
        className="inline-flex items-center justify-center p-0 text-amber-500 hover:text-amber-600 focus:outline-hidden cursor-pointer"
        aria-label="Qantas Calculator Failed to Calculate segment"
      >
        <InfoIcon className="w-5 h-5 text-amber-500" />
      </button>
    );
  } else if (matchesAirlinePoints && matchesElitePoints) {
    return (
      <button
        type="button"
        title={matchTooltip}
        className="inline-flex items-center justify-center p-0 text-emerald-600 focus:outline-hidden cursor-pointer"
        aria-label={matchTooltip}
      >
        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
      </button>
    );
  } else {
    return (
      <button
        type="button"
        title="Does not match Qantas Calculator"
        className="inline-flex items-center justify-center p-0 text-red-600 hover:text-red-700 focus:outline-hidden cursor-pointer"
        aria-label="Does not match Qantas Calculator for this segment"
      >
        <CancelIcon className="w-5 h-5 text-red-600" />
      </button>
    );
  }
};

const SegmentTableRow: React.FC<{
  segmentIdx: number;
  segmentResult: SegmentResult;
  compareWithQantasCalc: boolean;
}> = ({ segmentIdx, segmentResult, compareWithQantasCalc }) => {
  const { segment, error } = segmentResult;

  const [expandRow, setExpandRow] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  if (error) {
    const errorColSpan = compareWithQantasCalc ? 4 : 3;
    const errorMsg = error instanceof Error ? error.message : String(error);
    return (
      <tr data-testid={`segment-result-row-${segmentIdx}`} className="border-b border-slate-200">
        <th
          scope="row"
          data-testid={`segment-result-route-${segmentIdx}`}
          className="px-3 py-3 sm:px-4 font-medium text-slate-900 whitespace-nowrap text-left"
        >
          {segment.fromAirport?.iata?.toLowerCase()} - {segment.toAirport?.iata?.toLowerCase()}
        </th>
        <td colSpan={errorColSpan} className="px-3 py-3 sm:px-4 text-right">
          <div
            role="alert"
            className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-700 text-left"
          >
            {errorMsg}
          </div>
        </td>
      </tr>
    );
  }

  const qantasAPIError = segmentResult.qantasAPIResults?.error;
  const qantasAirlinePoints = segmentResult.qantasAPIResults?.qantasData?.airlinePoints;
  const qantasElitePoints = segmentResult.qantasAPIResults?.qantasData?.elitePoints;

  const matchesAirlinePoints =
    qantasAirlinePoints !== undefined &&
    isAirlinePointsMatch(segmentResult.airlinePoints ?? 0, qantasAirlinePoints);
  const matchesElitePoints =
    qantasElitePoints !== undefined &&
    isElitePointsMatch(segmentResult.elitePoints ?? 0, qantasElitePoints);

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-200"
        data-testid={`segment-result-row-${segmentIdx}`}
      >
        <th
          scope="row"
          data-testid={`segment-result-route-${segmentIdx}`}
          onClick={() => setExpandRow((prev) => !prev)}
          className="px-3.5 py-3.5 sm:px-4 text-sm sm:text-base font-medium text-slate-900 whitespace-nowrap text-left"
        >
          {segment.fromAirport?.iata?.toLowerCase()} - {segment.toAirport?.iata?.toLowerCase()}
        </th>
        <td
          data-testid={`segment-result-points-${segmentIdx}`}
          onClick={() => setExpandRow((prev) => !prev)}
          className="px-3.5 py-3.5 sm:px-4 text-sm sm:text-base text-right text-slate-700"
        >
          {segmentResult.airlinePoints?.toLocaleString()}
        </td>
        <td
          data-testid={`segment-result-status-credits-${segmentIdx}`}
          onClick={() => setExpandRow((prev) => !prev)}
          className="px-3.5 py-3.5 sm:px-4 text-sm sm:text-base text-right text-slate-700"
        >
          {segmentResult.elitePoints?.toLocaleString()}
        </td>
        {compareWithQantasCalc && (
          <td
            onClick={() => {
              if (matchesAirlinePoints && matchesElitePoints) {
                setExpandRow((prev) => !prev);
              } else {
                setOpenModal(true);
              }
            }}
            className="px-3.5 py-3.5 sm:px-4 text-sm sm:text-base text-right"
          >
            <MatchesQantasSegmentIcon
              segmentResult={segmentResult}
              qantasAPIError={qantasAPIError}
              matchesAirlinePoints={matchesAirlinePoints}
              matchesElitePoints={matchesElitePoints}
            />
          </td>
        )}
        <td onClick={() => setExpandRow((prev) => !prev)} className="px-1 py-3 sm:px-2 text-right">
          <button
            type="button"
            aria-expanded={expandRow}
            aria-label={
              expandRow
                ? `Hide calculation breakdown for segment ${segmentIdx + 1}`
                : `Show calculation breakdown for segment ${segmentIdx + 1}`
            }
            onClick={(e) => {
              e.stopPropagation();
              setExpandRow((prev) => !prev);
            }}
            className="inline-flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
          >
            {expandRow ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </td>
      </tr>
      {expandRow && (
        <tr className="bg-slate-50/50">
          <td
            colSpan={compareWithQantasCalc ? 5 : 4}
            className="p-4 text-sm text-slate-700 break-words"
          >
            <div className="flex flex-col gap-2">
              <p>Airline: {ALL_AIRLINES[segment.airline] || segment.airline.toUpperCase()}</p>
              <p>Fare Class: {getFareClassDisplay(segment.fareClass)}</p>
              <div className="flex items-center gap-1">
                <p>Qantas Points:</p>
                <AirlinePointsDisplay segmentResult={segmentResult} />
              </div>
              <p>Status Credits: {segmentResult.elitePoints?.toLocaleString()}</p>
              <div className="flex items-center gap-1 flex-wrap">
                <p>Earn Category:</p>
                <a
                  href={EARN_CATEGORY_URLS[segment.airline]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {EARN_CATEGORY_DISPLAY[segmentResult.fareEarnCategory || ""]}
                </a>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <p>Earning Table:</p>
                <a
                  href={segmentResult.ruleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {segmentResult.ruleName}
                </a>
              </div>
              <p>Calculation Notes: {segmentResult.notes}</p>
            </div>
          </td>
        </tr>
      )}
      {openModal && (
        <tr>
          <td colSpan={compareWithQantasCalc ? 5 : 4} className="p-0 border-0">
            {qantasAPIError && (
              <MatchesQantasSegmentErrorDialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                error={qantasAPIError}
              />
            )}
            {!qantasAPIError && (!matchesAirlinePoints || !matchesElitePoints) && (
              <MatchesQantasSegmentMisMatchDialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                segmentResult={segmentResult}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
};
