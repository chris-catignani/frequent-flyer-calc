import { fetchDataFromQantas } from "@/app/_shared/calculators/qantas/qantasAPI/qantasAPIClient";
import { getPartnerRules } from "@/app/_shared/calculators/qantas/partner/partnerRules";
import { getQantasEarnCategory } from "@/app/_shared/calculators/qantas/qantas/qantasEarnCategories";
import {
  getQantasMinimumPoints,
  getQantasRules,
} from "@/app/_shared/calculators/qantas/qantas/qantasRules";
import {
  getPartnerEarnCategory,
  qualifiesForElitePoints,
} from "@/app/_shared/calculators/qantas/partner/partnerEarnCategories";
import { LATAM_AIRLINES, ONEWORLD_AIRLINES } from "@/app/_shared/models/constants";
import { JAL_AIRLINES, JETSTAR_AIRLINES } from "@/app/_shared/models/qantasConstants";
import type { Segment } from "@/app/_shared/models/segment";
import type {
  AirlinePointsBreakdown,
  CalculationResult,
  EliteBonus,
  QantasApiResults,
} from "@/types/calculator";
import type { CalculationOptions } from "@/types/program";
import type { Rule } from "@/app/_shared/calculators/qantas/rules";

const partnerRules = getPartnerRules(); // this is a map of airlineCode -> rules[]
const qantasRules = getQantasRules(); // this is a map of airlineCode -> rules[]
const qantasMinPoints = getQantasMinimumPoints();

export const supportedAirlines = new Set([
  ...Object.keys(ONEWORLD_AIRLINES),
  ...Object.keys(LATAM_AIRLINES),
  ...JETSTAR_AIRLINES,
  ...JAL_AIRLINES,
  "af",
  "nf",
  "mu",
  "ly",
  "ek",
  "kl",
  "ws",
]);

export const eliteStatusBonusAirlines = new Set(["aa", "qf", "jq", "gk"]);
export const eliteStatusBonusMultiples: Record<string, number> = {
  silver: 0.5,
  gold: 0.75,
  platinum: 1.0,
  "platinum one": 1.0,
};

export const calculate = async (
  segments: Segment[],
  eliteStatus: string = "",
  priceLessTaxes: number = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
  compareWithQantasCalcOrOptions: CalculationOptions | boolean = false
): Promise<CalculationResult> => {
  const compareWithQantasCalc =
    typeof compareWithQantasCalcOrOptions === "boolean"
      ? compareWithQantasCalcOrOptions
      : Boolean(
          compareWithQantasCalcOrOptions?.compareWithProgramApi ??
          compareWithQantasCalcOrOptions?.compareWithQantasCalc
        );

  const retval: CalculationResult = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  for (const segment of segments) {
    if (!supportedAirlines.has(segment.airline)) {
      retval.segmentResults.push({
        segment,
        error: new Error(`Qantas does not support earning on ${segment.airline}`),
      });
      retval.containsErrors = true;
      break;
    }

    try {
      const segmentResult = calculateSegment(segment, eliteStatus.toLowerCase());

      let qantasAPIResults: QantasApiResults = {};
      if (compareWithQantasCalc) {
        qantasAPIResults = await getDataFromQantasCalc(segment, eliteStatus);
      }

      retval.segmentResults.push({
        segment,
        ...segmentResult,
        qantasAPIResults,
      });
      retval.airlinePoints += segmentResult.airlinePoints;
      retval.elitePoints += segmentResult.elitePoints;
    } catch (err) {
      retval.segmentResults.push({
        error: err,
        segment,
      });
      retval.containsErrors = true;
    }
  }

  return retval;
};

const getDataFromQantasCalc = async (
  segment: Segment,
  eliteStatus: string
): Promise<QantasApiResults> => {
  let fareEarnCategory: string | null = null;
  if (segment.airline in qantasRules) {
    fareEarnCategory = getQantasEarnCategory(segment);
  } else {
    fareEarnCategory = getPartnerEarnCategory(segment);
  }

  return await fetchDataFromQantas(segment, eliteStatus, fareEarnCategory);
};

interface SegmentCalculationReturn {
  ruleName: string;
  ruleUrl: string;
  fareEarnCategory: string;
  notes?: string;
  elitePoints: number;
  airlinePoints: number;
  airlinePointsBreakdown: AirlinePointsBreakdown;
}

const calculateSegment = (segment: Segment, eliteStatus: string): SegmentCalculationReturn => {
  const { fareEarnCategory, rule, minPoints, earnsElitePoints } =
    getEarnCalculationRequirements(segment);

  if (!rule) {
    throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`);
  }

  const calculation = rule.calculate(segment, fareEarnCategory);

  let eliteBonus: EliteBonus = {};

  if (eliteStatusBonusMultiples[eliteStatus] && eliteStatusBonusAirlines.has(segment.airline)) {
    eliteBonus = {
      eligibleFareCategory: fareEarnCategory,
      airlinePoints: Math.floor(calculation.airlinePoints * eliteStatusBonusMultiples[eliteStatus]),
    };
  }

  const airlinePointsBreakdown: AirlinePointsBreakdown = {
    basePoints: calculation.airlinePoints,
    eliteBonus,
    minPoints,
    totalEarned: Math.max(
      calculation.airlinePoints + (eliteBonus?.airlinePoints || 0),
      minPoints || 0
    ),
  };

  return {
    ruleName: rule.name,
    ruleUrl: calculation.ruleUrl || "",
    fareEarnCategory,
    notes: calculation.notes,
    elitePoints: earnsElitePoints ? calculation.elitePoints : 0,
    airlinePoints: airlinePointsBreakdown.totalEarned || 0,
    airlinePointsBreakdown,
  };
};

interface EarnCalculationRequirements {
  fareEarnCategory: string;
  rule: Rule | undefined;
  minPoints?: number;
  earnsElitePoints: boolean;
}

// TODO clean this up
const getEarnCalculationRequirements = (segment: Segment): EarnCalculationRequirements => {
  if (segment.airline in qantasRules) {
    const fareEarnCategory = getQantasEarnCategory(segment);

    const rule = qantasRules[segment.airline]?.find((rule) => {
      return rule.applies(segment, fareEarnCategory);
    });

    const minPoints =
      rule?.getMinPoints(fareEarnCategory) ?? qantasMinPoints[segment.airline]?.[fareEarnCategory];

    return { fareEarnCategory, rule, minPoints, earnsElitePoints: true };
  } else {
    const fareEarnCategory = getPartnerEarnCategory(segment);

    const rule = partnerRules[segment.airline]?.find((rule) => {
      return rule.applies(segment, fareEarnCategory);
    });

    const earnsElitePoints = qualifiesForElitePoints(segment);

    return { fareEarnCategory, rule, minPoints: undefined, earnsElitePoints };
  }
};
