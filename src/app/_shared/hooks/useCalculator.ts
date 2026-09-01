"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Segment } from "@/app/_shared/models/segment";
import { SegmentInput } from "@/app/_shared/models/segmentInput";
import { getAirport } from "@/app/_shared/utils/airports";
import {
  createUrlQueryParams,
  parseUrlQueryParams,
} from "@/app/_shared/utils/segmentInputUrlParser";
import {
  deleteAllSavedCalculations,
  deleteSavedCalculationAtIdx,
  getSavedCalculations,
  saveCalculation,
  type SavedCalculation,
} from "@/app/_shared/utils/recentCalculations";
import { validate, type SegmentErrors } from "@/app/_shared/components/segmentInput";
import { trackCalculationCompleted, trackQantasApiMismatch } from "@/app/_shared/utils/analytics";
import { isAirlinePointsMatch, isElitePointsMatch } from "@/app/_shared/utils/comparison";
import type { CalculationResult } from "@/types/calculator";
import type { FrequentFlyerProgram } from "@/types/program";

export interface UseCalculatorOptions {
  program: FrequentFlyerProgram;
  initialCompareWithProgramApi?: boolean;
  initialPriceLessTaxes?: number;
  storageKey?: string;
}

export interface UseCalculatorReturn {
  // State
  segmentInputs: SegmentInput[];
  inputErrors: SegmentErrors;
  eliteStatus: string;
  tripType: string;
  compareWithProgramApi: boolean;
  isCalculating: boolean;
  calculationOutput: CalculationResult | null;
  savedCalculations: SavedCalculation[];

  // Actions
  setEliteStatus: (status: string) => void;
  setTripType: (tripType: string) => void;
  setCompareWithProgramApi: (enabled: boolean) => void;
  addSegment: () => void;
  deleteSegment: (index: number) => void;
  updateSegment: (index: number, segment: SegmentInput) => void;
  reorderSegments: (originIndex: number, targetIndex: number) => void;
  setAllSegmentInputs: (segments: SegmentInput[]) => void;
  calculate: () => Promise<void>;
  loadRecentCalculation: (index: number) => void;
  deleteRecentCalculation: (index: number) => void;
  clearAllRecentCalculations: () => void;
}

export function useCalculator({
  program,
  initialCompareWithProgramApi = false,
  initialPriceLessTaxes = 0.0,
  storageKey,
}: UseCalculatorOptions): UseCalculatorReturn {
  const searchParams = useSearchParams();
  const effectiveStorageKey =
    storageKey ??
    (program.id === "qantas" ? "saved-calculations" : `saved-calculations-${program.id}`);

  const [inputErrors, setInputErrors] = useState<SegmentErrors>({});
  const [eliteStatus, setEliteStatus] = useState<string>(program.defaultEliteStatus);
  const [tripType, setTripType] = useState<string>("one way");
  const [compareWithProgramApi, setCompareWithProgramApi] = useState<boolean>(
    initialCompareWithProgramApi
  );
  const [priceLessTaxes] = useState<number>(initialPriceLessTaxes);
  const [segmentInputs, setSegmentInputs] = useState<SegmentInput[]>([
    new SegmentInput(program.defaultAirline, program.defaultFareClass ?? "", "", ""),
  ]);

  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationOutput, setCalculationOutput] = useState<CalculationResult | null>(null);

  const calcIdRef = useRef<number>(0);
  const segmentInputsRef = useRef<SegmentInput[]>(segmentInputs);
  segmentInputsRef.current = segmentInputs;

  const setAllSegmentInputs = useCallback((theSegmentInputs: SegmentInput[]) => {
    theSegmentInputs.forEach((segmentInput) => {
      segmentInput.fromAirport = getAirport(segmentInput.fromAirportText);
      segmentInput.toAirport = getAirport(segmentInput.toAirportText);
    });

    const currentSegments = segmentInputsRef.current;
    let inputsChanged = false;
    if (theSegmentInputs.length !== currentSegments.length) {
      inputsChanged = true;
    } else {
      for (let i = 0; i < theSegmentInputs.length; i++) {
        for (const property of [
          "airline",
          "fromAirportText",
          "toAirportText",
          "fareClass",
        ] as const) {
          if (theSegmentInputs[i][property] !== currentSegments[i][property]) {
            inputsChanged = true;
            break;
          }
        }
      }
    }

    setSegmentInputs(theSegmentInputs);
    if (inputsChanged) {
      setCalculationOutput(null);
    }
  }, []);

  const setAllInputParams = useCallback(
    (
      urlEliteStatus?: string | null,
      urlTripType?: string | null,
      urlSegmentInputs?: SegmentInput[]
    ) => {
      if (urlEliteStatus) {
        setEliteStatus(urlEliteStatus);
      }
      if (urlTripType) {
        setTripType(urlTripType);
      }
      if (urlSegmentInputs) {
        setAllSegmentInputs(urlSegmentInputs);
      }
    },
    [setAllSegmentInputs]
  );

  // Hydrate from deep-link search params
  useEffect(() => {
    const {
      eliteStatus: urlEliteStatus,
      tripType: urlTripType,
      segmentInputs: urlSegmentInputs,
    } = parseUrlQueryParams(searchParams);

    setAllInputParams(urlEliteStatus, urlTripType, urlSegmentInputs);
  }, [searchParams, setAllInputParams]);

  // Load saved calculations on mount
  useEffect(() => {
    const loaded = getSavedCalculations(effectiveStorageKey);
    setSavedCalculations(loaded);
  }, [effectiveStorageKey]);

  const doCalculation = useCallback(
    async (
      theEliteStatus: string,
      theTripType: string,
      theCompareWithProgramApi: boolean,
      thePriceLessTaxes: number
    ) => {
      const currentCalcId = ++calcIdRef.current;
      setIsCalculating(true);
      setCalculationOutput(null);

      try {
        const segments = segmentInputs.map((segmentInput) => {
          return new Segment(
            segmentInput.airline,
            segmentInput.fareClass,
            segmentInput.fromAirport!,
            segmentInput.toAirport!
          );
        });

        if (theTripType === "return") {
          // add the segments in reverse, with from/to airports flipped
          for (let i = segments.length - 1; i >= 0; i--) {
            const { fromAirport, toAirport } = segments[i];
            segments.push(segments[i].clone({ fromAirport: toAirport, toAirport: fromAirport }));
          }
        }

        const calculationResult = await program.calculate(
          segments,
          theEliteStatus,
          thePriceLessTaxes,
          theCompareWithProgramApi
        );

        // Guard against race conditions from out-of-order async responses
        if (currentCalcId !== calcIdRef.current) {
          return;
        }

        setCalculationOutput(calculationResult);

        // Track calculation completed event
        trackCalculationCompleted({
          segmentResults: calculationResult.segmentResults,
          tripType: theTripType,
          eliteStatus: theEliteStatus,
          compareWithQantas: theCompareWithProgramApi,
          containsErrors: calculationResult.containsErrors,
          totalPoints: calculationResult.airlinePoints,
          totalStatusCredits: calculationResult.elitePoints,
        });

        // Track API comparison mismatches if comparison was active
        if (theCompareWithProgramApi && calculationResult.segmentResults) {
          calculationResult.segmentResults.forEach((segmentResult) => {
            const qantasData = segmentResult.qantasAPIResults?.qantasData;
            const qantasError = segmentResult.qantasAPIResults?.error as
              Error | { message?: string } | undefined;

            if (qantasError) {
              trackQantasApiMismatch({
                segment: segmentResult.segment,
                ourPoints: Number(segmentResult.airlinePoints) || 0,
                ourStatusCredits: Number(segmentResult.elitePoints) || 0,
                qantasPoints: null,
                qantasStatusCredits: null,
                qantasError: qantasError.message || String(qantasError),
                eliteStatus: theEliteStatus,
                tripType: theTripType,
              });
            } else if (qantasData) {
              const ourPoints = Number(segmentResult.airlinePoints) || 0;
              const ourStatusCredits = Number(segmentResult.elitePoints) || 0;
              const qantasPoints = Number(qantasData.airlinePoints) || 0;
              const qantasStatusCredits = Number(qantasData.elitePoints) || 0;

              const pointsMismatch = !isAirlinePointsMatch(ourPoints, qantasPoints);
              const statusCreditsMismatch = !isElitePointsMatch(
                ourStatusCredits,
                qantasStatusCredits
              );

              if (pointsMismatch || statusCreditsMismatch) {
                trackQantasApiMismatch({
                  segment: segmentResult.segment,
                  ourPoints,
                  ourStatusCredits,
                  qantasPoints,
                  qantasStatusCredits,
                  qantasError: null,
                  eliteStatus: theEliteStatus,
                  tripType: theTripType,
                });
              }
            }
          });
        }

        // Save the calculation
        const updatedSavedCalculations = saveCalculation(
          segmentInputs,
          theTripType,
          theEliteStatus,
          effectiveStorageKey
        );
        setSavedCalculations(updatedSavedCalculations);

        // Update URL query parameters
        const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
        const newParams = createUrlQueryParams(theEliteStatus, segmentInputs, theTripType);
        Object.entries(newParams).forEach(([k, v]) => {
          params.set(k, v);
        });
        if (
          typeof window !== "undefined" &&
          (!searchParams || searchParams.toString() !== params.toString())
        ) {
          const pathname = window.location.pathname || "";
          window.history.pushState(null, "", `${pathname}?${params.toString()}`);
        }
      } finally {
        if (currentCalcId === calcIdRef.current) {
          setIsCalculating(false);
        }
      }
    },
    [segmentInputs, program, effectiveStorageKey, searchParams]
  );

  const calculate = useCallback(async () => {
    const errors = validate(segmentInputs, program.segmentInputAdapter);
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
    } else {
      setInputErrors({});
      await doCalculation(eliteStatus, tripType, compareWithProgramApi, priceLessTaxes);
    }
  }, [
    segmentInputs,
    program.segmentInputAdapter,
    doCalculation,
    eliteStatus,
    tripType,
    compareWithProgramApi,
    priceLessTaxes,
  ]);

  const addSegment = useCallback(() => {
    const previousSegment = segmentInputs[segmentInputs.length - 1];
    const nextFromAirportText = previousSegment?.toAirportText ?? "";
    const nextFromAirport =
      previousSegment?.toAirport ??
      (nextFromAirportText.length === 3 ? getAirport(nextFromAirportText) : null);

    const newSegment = new SegmentInput(
      previousSegment?.airline ?? program.defaultAirline,
      "",
      nextFromAirportText,
      ""
    );
    newSegment.fromAirport = nextFromAirport;

    setSegmentInputs((prev) => [...prev, newSegment]);
    setCalculationOutput(null);
  }, [segmentInputs, program.defaultAirline]);

  const deleteSegment = useCallback((segmentInputIdx: number) => {
    setSegmentInputs((prev) => {
      const newSegmentInputs = [...prev];
      newSegmentInputs.splice(segmentInputIdx, 1);
      return newSegmentInputs;
    });
    setCalculationOutput(null);
  }, []);

  const updateSegment = useCallback((segmentInputIdx: number, segmentInput: SegmentInput) => {
    setSegmentInputs((prev) => {
      const oldSegmentInput = prev[segmentInputIdx];
      if (oldSegmentInput && oldSegmentInput.fromAirportText !== segmentInput.fromAirportText) {
        segmentInput.fromAirport =
          segmentInput.fromAirportText?.length === 3
            ? getAirport(segmentInput.fromAirportText)
            : null;
      }

      if (oldSegmentInput && oldSegmentInput.toAirportText !== segmentInput.toAirportText) {
        segmentInput.toAirport =
          segmentInput.toAirportText?.length === 3 ? getAirport(segmentInput.toAirportText) : null;
      }

      const newSegmentInputs = [...prev];
      newSegmentInputs[segmentInputIdx] = segmentInput;
      return newSegmentInputs;
    });

    setCalculationOutput(null);
  }, []);

  const reorderSegments = useCallback((originIdx: number, targetIdx: number) => {
    setSegmentInputs((prev) => {
      const newSegmentInputs = [...prev];
      const itemToMove = newSegmentInputs[originIdx];
      newSegmentInputs.splice(originIdx, 1);
      newSegmentInputs.splice(targetIdx, 0, itemToMove);
      return newSegmentInputs;
    });
    setCalculationOutput(null);
  }, []);

  const handleSetEliteStatus = useCallback(
    (newEliteStatus: string) => {
      setEliteStatus(newEliteStatus);
      if (
        calculationOutput &&
        Object.keys(validate(segmentInputs, program.segmentInputAdapter)).length === 0
      ) {
        doCalculation(newEliteStatus, tripType, compareWithProgramApi, priceLessTaxes);
      }
    },
    [
      calculationOutput,
      segmentInputs,
      program.segmentInputAdapter,
      doCalculation,
      tripType,
      compareWithProgramApi,
      priceLessTaxes,
    ]
  );

  const handleSetTripType = useCallback(
    (newTripType: string) => {
      setTripType(newTripType);
      if (
        calculationOutput &&
        Object.keys(validate(segmentInputs, program.segmentInputAdapter)).length === 0
      ) {
        doCalculation(eliteStatus, newTripType, compareWithProgramApi, priceLessTaxes);
      }
    },
    [
      calculationOutput,
      segmentInputs,
      program.segmentInputAdapter,
      doCalculation,
      eliteStatus,
      compareWithProgramApi,
      priceLessTaxes,
    ]
  );

  const handleSetCompareWithProgramApi = useCallback(
    (newCompare: boolean) => {
      setCompareWithProgramApi(newCompare);
      if (
        calculationOutput &&
        Object.keys(validate(segmentInputs, program.segmentInputAdapter)).length === 0
      ) {
        doCalculation(eliteStatus, tripType, newCompare, priceLessTaxes);
      }
    },
    [
      calculationOutput,
      segmentInputs,
      program.segmentInputAdapter,
      doCalculation,
      eliteStatus,
      tripType,
      priceLessTaxes,
    ]
  );

  const loadRecentCalculation = useCallback(
    (idx: number) => {
      const savedCalculation = savedCalculations[idx];
      if (savedCalculation) {
        setAllInputParams(
          savedCalculation.eliteStatus,
          savedCalculation.tripType,
          savedCalculation.segmentInputs
        );
      }
    },
    [savedCalculations, setAllInputParams]
  );

  const deleteRecentCalculation = useCallback(
    (idx: number) => {
      const updated = deleteSavedCalculationAtIdx(idx, effectiveStorageKey);
      setSavedCalculations(updated);
    },
    [effectiveStorageKey]
  );

  const clearAllRecentCalculations = useCallback(() => {
    const updated = deleteAllSavedCalculations(effectiveStorageKey);
    setSavedCalculations(updated);
  }, [effectiveStorageKey]);

  return {
    segmentInputs,
    inputErrors,
    eliteStatus,
    tripType,
    compareWithProgramApi,
    isCalculating,
    calculationOutput,
    savedCalculations,
    setEliteStatus: handleSetEliteStatus,
    setTripType: handleSetTripType,
    setCompareWithProgramApi: handleSetCompareWithProgramApi,
    addSegment,
    deleteSegment,
    updateSegment,
    reorderSegments,
    setAllSegmentInputs,
    calculate,
    loadRecentCalculation,
    deleteRecentCalculation,
    clearAllRecentCalculations,
  };
}
