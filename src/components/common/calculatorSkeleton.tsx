import React from "react";

export const CalculatorSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading flight calculator"
      className="w-full min-h-[340px] sm:min-h-[260px] sm:rounded-xl border-0 sm:border border-slate-200 bg-transparent sm:bg-white p-0 sm:p-4 shadow-none sm:shadow-sm mt-4 animate-pulse"
    >
      <span className="sr-only">Loading calculator...</span>
      {/* Top row: Trip type toggle & Elite status placeholders */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
        <div className="h-8 w-40 bg-slate-200 rounded-md" />
        <div className="h-8 w-48 bg-slate-200 rounded-md self-center sm:self-auto" />
      </div>

      {/* Segment row placeholder */}
      <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
        <div className="h-10 w-full sm:w-1/4 bg-slate-200 rounded" />
        <div className="h-10 w-full sm:w-1/4 bg-slate-200 rounded" />
        <div className="h-10 w-full sm:w-1/4 bg-slate-200 rounded" />
        <div className="h-10 w-full sm:w-1/4 bg-slate-200 rounded" />
      </div>

      {/* Action buttons row */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="h-10 w-32 bg-slate-200 rounded" />
        <div className="h-11 w-36 bg-slate-300 rounded-full" />
        <div className="h-8 w-40 bg-slate-200 rounded" />
      </div>
    </div>
  );
};
