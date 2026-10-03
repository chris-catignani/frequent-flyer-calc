import React from "react";
import { ALL_AIRLINES } from "@/constants/airlines";
import type { CalculationResult, SegmentResult } from "@/types/calculator";

const routeLabel = (segmentResult: SegmentResult) =>
  `${segmentResult.segment.fromAirport?.iata?.toLowerCase()} - ${segmentResult.segment.toAirport?.iata?.toLowerCase()}`;

const breakdownText = (segmentResult: SegmentResult): string => {
  const { airlinePointsBreakdown: points, elitePointsBreakdown: status } = segmentResult;
  const parts = [`Base ${points?.basePoints?.toLocaleString() ?? 0}`];
  if (points?.cabinBonus) parts.push(`cabin bonus ${points.cabinBonus.toLocaleString()}`);
  if (points?.eliteBonus?.airlinePoints)
    parts.push(`elite bonus ${points.eliteBonus.airlinePoints.toLocaleString()}`);
  if (points?.communityBonus)
    parts.push(`community bonus ${points.communityBonus.toLocaleString()}`);
  const statusText = status?.communityBonus
    ? ` · Status: ${status.basePoints.toLocaleString()} + community bonus ${status.communityBonus.toLocaleString()}`
    : "";
  return `${parts.join(" + ")}${statusText}`;
};

export const AtmosSegmentResults: React.FC<{ calculatedData?: CalculationResult | null }> = ({
  calculatedData,
}) => {
  if (!calculatedData) {
    return null;
  }

  return (
    <div
      data-testid="segment-results-table"
      className="w-full min-w-0 max-w-full sm:max-w-2xl mx-auto mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs"
    >
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">
            <th scope="col" className="px-2 py-2.5 sm:px-4 sm:py-3.5">
              Route
            </th>
            <th scope="col" className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-right whitespace-nowrap">
              <span className="hidden sm:inline">Atmos </span>Points
            </th>
            <th scope="col" className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-right whitespace-nowrap">
              Status<span className="hidden sm:inline"> Points</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {calculatedData.segmentResults.map((segmentResult, idx) => (
            <tr key={idx} data-testid={`segment-result-row-${idx}`} className="align-top">
              <th
                scope="row"
                data-testid={`segment-result-route-${idx}`}
                className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-slate-900 text-left"
              >
                <span className="whitespace-nowrap">{routeLabel(segmentResult)}</span>
                <span className="block text-xs font-normal text-slate-500">
                  {ALL_AIRLINES[segmentResult.segment.airline] ??
                    segmentResult.segment.airline.toUpperCase()}
                </span>
                {segmentResult.error ? (
                  <span role="alert" className="mt-1 block text-xs font-normal text-red-700">
                    {segmentResult.error instanceof Error
                      ? segmentResult.error.message
                      : String(segmentResult.error)}
                  </span>
                ) : (
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    <a
                      href={segmentResult.ruleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {segmentResult.ruleName}
                    </a>{" "}
                    — {segmentResult.notes}. {breakdownText(segmentResult)}
                  </span>
                )}
              </th>
              <td
                data-testid={`segment-result-points-${idx}`}
                className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-right text-slate-700 whitespace-nowrap"
              >
                {segmentResult.error ? "—" : segmentResult.airlinePoints?.toLocaleString()}
              </td>
              <td
                data-testid={`segment-result-status-points-${idx}`}
                className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-right text-slate-700 whitespace-nowrap"
              >
                {segmentResult.error ? "—" : segmentResult.elitePoints?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
