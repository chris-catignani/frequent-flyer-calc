import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/common/icons";
import { parseEncodedTextItin, parseItaMatrixInput } from "@/utils/segmentInputParser";
import type { SegmentInput } from "@/models/segmentInput";

export interface AdvancedInputProps {
  setSegmentInputs: (segmentInputs: SegmentInput[]) => void;
}

export const AdvancedInput: React.FC<AdvancedInputProps> = ({ setSegmentInputs }) => {
  const [isOpen, setOpen] = useState(false);

  const onApplyClicked = (segmentInputs: SegmentInput[]) => {
    setSegmentInputs(segmentInputs);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        data-testid="advanced-input-toggle"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-slate-700 hover:text-slate-900 cursor-pointer w-fit select-none"
      >
        <span>Advanced Input</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1">
          <AdvancedInputSelection onApplyClicked={onApplyClicked} />
        </div>
      )}
    </div>
  );
};

interface AdvancedInputSelectionProps {
  onApplyClicked: (segmentInputs: SegmentInput[]) => void;
}

const AdvancedInputSelection: React.FC<AdvancedInputSelectionProps> = ({ onApplyClicked }) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [inputError, setInputError] = useState<Record<string, string>>({});
  const [textItin, setTextItin] = useState<string>("");
  const [itaMatrixJson, setItaMatrixJson] = useState<string>("");

  const handleAccordionToggle = (accordionPanel: string) => {
    setExpanded(expanded === accordionPanel ? false : accordionPanel);
  };

  const applyTextItinInput = () => {
    const { segmentInputs, parsingError } = parseEncodedTextItin(textItin, "\n", " ");

    if (parsingError) {
      setExpanded("text-itin");
      setInputError({ "text-itin": parsingError });
    } else {
      setExpanded(false);
      setInputError({});
      onApplyClicked(segmentInputs);
    }
  };

  const applyItaMatrixInput = () => {
    const { segmentInputs, parsingError } = parseItaMatrixInput(itaMatrixJson);

    if (parsingError) {
      setExpanded("ita-matrix");
      setInputError({ "ita-matrix": parsingError });
    } else {
      setExpanded(false);
      setInputError({});
      onApplyClicked(segmentInputs);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
        <button
          type="button"
          data-testid="advanced-input-text-accordion"
          onClick={() => handleAccordionToggle("text-itin")}
          aria-expanded={expanded === "text-itin"}
          className="flex w-full items-center justify-between bg-slate-50 px-4 py-3.5 text-left text-sm sm:text-base font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span>Free Form Text Itinerary</span>
          {expanded === "text-itin" ? (
            <ChevronUpIcon className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {expanded === "text-itin" && (
          <div className="border-t border-slate-200 p-4">
            <FreeFormTextItinerary
              textItin={textItin}
              textItinChanged={setTextItin}
              error={inputError["text-itin"]}
            />
            <div className="mt-3.5 flex justify-end">
              <button
                type="button"
                data-testid="advanced-input-text-apply-button"
                onClick={applyTextItinInput}
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
        <button
          type="button"
          data-testid="advanced-input-ita-accordion"
          onClick={() => handleAccordionToggle("ita-matrix")}
          aria-expanded={expanded === "ita-matrix"}
          className="flex w-full items-center justify-between bg-slate-50 px-4 py-3.5 text-left text-sm sm:text-base font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span>ITA Matrix Itinerary</span>
          {expanded === "ita-matrix" ? (
            <ChevronUpIcon className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {expanded === "ita-matrix" && (
          <div className="border-t border-slate-200 p-4">
            <ItaMatrixItinerary
              itaMatrixJson={itaMatrixJson}
              itaMatrixJsonChanged={setItaMatrixJson}
              error={inputError["ita-matrix"]}
            />
            <div className="mt-3.5 flex justify-end">
              <button
                type="button"
                data-testid="advanced-input-ita-apply-button"
                onClick={applyItaMatrixInput}
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface FreeFormTextItineraryProps {
  textItin: string;
  textItinChanged: (value: string) => void;
  error?: string;
}

const FreeFormTextItinerary: React.FC<FreeFormTextItineraryProps> = ({
  textItin,
  textItinChanged,
  error,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-slate-600">
        <p>Type out an itinerary below, click apply followed by calculate.</p>
        <p className="mt-1">The itinerary format rules are:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Each segment of the itinerary should be on its own line</li>
          <li>
            Format a segment as: &lt;airline iata&gt; &lt;from airport iata&gt; &lt;to airport
            iata&gt; &lt;fare class letter&gt;
            <ul className="list-circle pl-5 mt-0.5">
              <li>For example: qf syd mel i</li>
            </ul>
          </li>
        </ul>
      </div>
      <div data-testid="advanced-input-text-field" className="w-full">
        <textarea
          rows={6}
          placeholder="Text Itinerary here"
          value={textItin}
          onChange={(e) => textItinChanged(e.target.value)}
          className={`w-full rounded-md border ${
            error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-primary"
          } p-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
};

interface ItaMatrixItineraryProps {
  itaMatrixJson: string;
  itaMatrixJsonChanged: (value: string) => void;
  error?: string;
}

const ItaMatrixItinerary: React.FC<ItaMatrixItineraryProps> = ({
  itaMatrixJson,
  itaMatrixJsonChanged,
  error,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600">
        Paste the ITA Matrix itinerary below to calculate the Qantas Points and Status Credits.
        <br />
        On the &quot;Itinerary Details&quot; page, in the &quot;Share &amp; Export&quot; section,
        select &quot;Copy itinerary as JSON&quot; and paste the results below. Then click apply
        followed by calculate.
      </p>
      <div data-testid="advanced-input-ita-field" className="w-full">
        <textarea
          rows={6}
          placeholder="Paste ITA Matrix JSON here"
          value={itaMatrixJson}
          onChange={(e) => itaMatrixJsonChanged(e.target.value)}
          className={`w-full rounded-md border ${
            error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-primary"
          } p-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
};
