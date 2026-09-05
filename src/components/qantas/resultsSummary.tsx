import React, { useState } from "react";
import { Dialog } from "@/components/common/dialog";
import { CheckCircleIcon, CancelIcon, InfoIcon } from "@/components/common/icons";
import type { CalculationResult } from "@/types/calculator";
import {
  isAirlinePointsMatch,
  isClosePointsMatch,
  isElitePointsMatch,
  POINTS_TOLERANCE_PER_SEGMENT,
} from "@/utils/comparison";

export interface ResultsSummaryProps {
  calculationOutput?: CalculationResult | null;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
}

interface MatchesQantasErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: Error | { message?: string };
}

const MatchesQantasErrorDialog: React.FC<MatchesQantasErrorDialogProps> = ({
  open,
  onClose,
  error,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Qantas Calculator failed to calculate at least one segment"
    >
      <div className="flex flex-col gap-2">
        <p>{error.message}</p>
        <p className="mt-2">See the results below to see details by segment</p>
      </div>
    </Dialog>
  );
};

interface MatchesQantasMisMatchDialogProps {
  open: boolean;
  onClose: () => void;
  field: "airlinePoints" | "elitePoints";
  expectedValue?: number;
  actualValue?: number;
}

const MatchesQantasMisMatchDialog: React.FC<MatchesQantasMisMatchDialogProps> = ({
  open,
  onClose,
  field,
  expectedValue,
  actualValue,
}) => {
  const fieldLabel = field === "airlinePoints" ? "Qantas Points" : "Status Credits";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Qantas Calculator results do not match our results"
    >
      <div className="flex flex-col gap-1">
        <p>Our Results:</p>
        <p>{fieldLabel + ": " + expectedValue}</p>
        <p className="mt-2">Qantas Calculator Results:</p>
        <p>{fieldLabel + ": " + actualValue}</p>
        <p className="mt-2">See the results below to see details by segment</p>
      </div>
    </Dialog>
  );
};

interface MatchesQantasAPIIconProps {
  calculationOutput: CalculationResult;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
  expectedValue?: number;
  fieldToCheck: "airlinePoints" | "elitePoints";
}

const MatchesQantasAPIIcon: React.FC<MatchesQantasAPIIconProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
  expectedValue,
  fieldToCheck,
}) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!compareWithQantasCalc || isCalculating) {
    return null;
  }

  let sumOfQantasAPICalc = 0;
  let qantasAPICalcError: Error | { message?: string } | null = null;
  calculationOutput.segmentResults.forEach((segmentResult) => {
    if (segmentResult.qantasAPIResults?.error) {
      qantasAPICalcError = segmentResult.qantasAPIResults.error as Error;
    } else {
      sumOfQantasAPICalc +=
        (segmentResult.qantasAPIResults?.qantasData?.[fieldToCheck] as number) || 0;
    }
  });

  const numSegments = calculationOutput.segmentResults.length;
  const allowedTolerance =
    fieldToCheck === "airlinePoints" ? numSegments * POINTS_TOLERANCE_PER_SEGMENT : 0;

  const isMatch =
    fieldToCheck === "airlinePoints"
      ? isAirlinePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc, allowedTolerance)
      : isElitePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc);

  const isCloseMatch =
    isMatch &&
    fieldToCheck === "airlinePoints" &&
    isClosePointsMatch(expectedValue ?? 0, sumOfQantasAPICalc, allowedTolerance);

  const matchTooltip = isCloseMatch
    ? "Matches Qantas Calculator results (within rounding difference)"
    : "Matches Qantas Calculator results";

  if (qantasAPICalcError) {
    return (
      <div className="inline-flex items-center">
        <button
          type="button"
          onClick={handleClickOpen}
          className="inline-flex items-center justify-center p-0 text-amber-500 hover:text-amber-600 focus:outline-hidden cursor-pointer"
          aria-label="View Qantas API calculation error details"
        >
          <InfoIcon className="w-5 h-5 text-amber-500" />
        </button>
        <MatchesQantasErrorDialog open={open} onClose={handleClose} error={qantasAPICalcError} />
      </div>
    );
  } else if (isMatch) {
    return (
      <div className="inline-flex items-center" title={matchTooltip}>
        <button
          type="button"
          className="inline-flex items-center justify-center p-0 text-emerald-600 focus:outline-hidden cursor-default"
          aria-label={matchTooltip}
        >
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
        </button>
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-center">
        <button
          type="button"
          onClick={handleClickOpen}
          className="inline-flex items-center justify-center p-0 text-red-600 hover:text-red-700 focus:outline-hidden cursor-pointer"
          aria-label="View Qantas API calculation mismatch details"
        >
          <CancelIcon className="w-5 h-5 text-red-600" />
        </button>
        <MatchesQantasMisMatchDialog
          open={open}
          onClose={handleClose}
          field={fieldToCheck}
          expectedValue={expectedValue}
          actualValue={sumOfQantasAPICalc}
        />
      </div>
    );
  }
};

interface TotalPointsEarnedProps {
  calculationOutput: CalculationResult;
  compareWithQantasCalc: boolean;
  isCalculating: boolean;
}

const TotalAirlinePointsEarned: React.FC<TotalPointsEarnedProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <h3
        className="text-xl sm:text-2xl font-semibold text-slate-800"
        data-testid="total-points-earned"
      >
        Qantas Points Earned: {calculationOutput.airlinePoints?.toLocaleString()}
      </h3>
      <MatchesQantasAPIIcon
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
        expectedValue={calculationOutput.airlinePoints}
        fieldToCheck={"airlinePoints"}
      />
    </div>
  );
};

const TotalElitePointsEarned: React.FC<TotalPointsEarnedProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <h3
        className="text-xl sm:text-2xl font-semibold text-slate-800"
        data-testid="total-status-credits-earned"
      >
        Status Credits Earned: {calculationOutput.elitePoints?.toLocaleString()}
      </h3>
      <MatchesQantasAPIIcon
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
        expectedValue={calculationOutput.elitePoints}
        fieldToCheck={"elitePoints"}
      />
    </div>
  );
};

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  calculationOutput,
  compareWithQantasCalc,
  isCalculating,
}) => {
  if (!calculationOutput) {
    return null;
  }

  return (
    <div
      className="mt-8 flex flex-col items-center justify-center gap-2"
      data-testid="results-summary"
    >
      <TotalAirlinePointsEarned
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
      />
      <TotalElitePointsEarned
        calculationOutput={calculationOutput}
        compareWithQantasCalc={compareWithQantasCalc}
        isCalculating={isCalculating}
      />
    </div>
  );
};
