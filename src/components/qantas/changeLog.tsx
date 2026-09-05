import React from "react";

export interface ChangeLogEntry {
  month: string;
  entries: string[];
}

// Newest month first. Add a new { month, entries } entry at the top when shipping a change.
export const CHANGE_LOG: ChangeLogEntry[] = [
  {
    month: "September 2026",
    entries: [
      "Added FAQ and earning rules guide.",
      "Improved official Qantas calculator comparison tolerance.",
      "Mobile UI and accessibility enhancements.",
    ],
  },
  {
    month: "July 2026",
    entries: [
      `Added autocomplete search for "from airport" and "to airport".`,
      "Fixed 4 incorrect Qantas, China Eastern, and KLM earning rates.",
      "Added Oman Air Muscat routes to the partner earning tables.",
      "Fixed the Jetstar Domestic New Zealand minimum points guarantee.",
    ],
  },
  {
    month: "March 2026",
    entries: ["Updated earnings rates for recent Jetstar Japan changes."],
  },
];

export const ChangeLog: React.FC = () => {
  return (
    <div className="w-full mt-8">
      <details className="group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 select-none">
          <span>Recent Updates</span>
          <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="mt-3 pl-2 border-l-2 border-slate-200 space-y-4">
          {CHANGE_LOG.map(({ month, entries }) => (
            <div key={month} className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {month}
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-sm text-slate-600">
                {entries.map((entry, idx) => (
                  <li key={idx}>{entry}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
