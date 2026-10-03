import { allocateByWeight } from "@/calculators/alaska/allocate";
import {
  ALASKA_GROUP_AIRLINES,
  ATMOS_ELITE_TIERS,
  ATMOS_SUPPORTED_AIRLINES,
  CHART_CATEGORY_DISPLAY,
  CHOOSE_HOW_YOU_EARN_URL,
  GLOBAL_LOCALS_BONUS,
  PARTNER_CHART,
  PARTNER_EARN_CHART_URL,
  POINTS_PER_DOLLAR,
  POINTS_PER_SEGMENT,
  REDEEMED_POINTS_PER_STATUS_POINT,
  STATUS_POINTS_EXCLUDED_PARTNERS,
  US_COUNTRIES,
  type ChartCategory,
} from "@/calculators/alaska/constants";
import {
  toAtmosOptions,
  usesRevenueEarning,
  type AtmosOptions,
} from "@/calculators/alaska/options";
import { getPartnerCabin, type AtmosCabin } from "@/calculators/alaska/partnerCabins";
import type { Segment } from "@/models/segment";
import type { CalculationResult } from "@/types/calculator";
import type { ProgramOptions } from "@/types/program";
import { calcDistance } from "@/utils/airports";

type TicketPool = "revenue" | "award";

interface BaseEarning {
  miles: number;
  basePoints: number; // earns the elite bonus
  cabinBonus: number; // partner chart bonus column; does not earn the elite bonus
  statusPoints: number; // before Global Locals
  ruleName: string;
  ruleUrl: string;
  notes: string;
  chartCategory?: ChartCategory;
  pool?: TicketPool; // filled from the ticket total after every segment is known
}

export const getEliteBonusMultiple = (eliteStatus: string): number =>
  ATMOS_ELITE_TIERS.find((tier) => tier.name.toLowerCase() === eliteStatus.toLowerCase())
    ?.bonusMultiple ?? 0;

export const isOutsideUnitedStates = (segment: Segment): boolean =>
  !US_COUNTRIES.has(segment.fromAirport.country) || !US_COUNTRIES.has(segment.toAirport.country);

const toChartCategory = (cabin: AtmosCabin, segment: Segment): ChartCategory => {
  if (cabin === "business" || cabin === "first") {
    return segment.fromAirport.country === segment.toAirport.country
      ? "domesticBusinessFirst"
      : "internationalBusinessFirst";
  }
  return cabin;
};

const calculateBase = (segment: Segment, miles: number, options: AtmosOptions): BaseEarning => {
  const isAward = options.bookingType === "award";
  const pooled = { miles, basePoints: 0, cabinBonus: 0, statusPoints: 0 };

  if (options.earnMethod === "distance") {
    return {
      miles,
      basePoints: isAward ? 0 : miles,
      cabinBonus: 0,
      statusPoints: miles,
      ruleName: "Distance traveled",
      ruleUrl: CHOOSE_HOW_YOU_EARN_URL,
      notes: `1 point per mile flown${isAward ? " (award ticket: status points only)" : ""}`,
    };
  }

  if (options.earnMethod === "segments") {
    return {
      miles,
      basePoints: isAward ? 0 : POINTS_PER_SEGMENT,
      cabinBonus: 0,
      statusPoints: POINTS_PER_SEGMENT,
      ruleName: "Segments flown",
      ruleUrl: CHOOSE_HOW_YOU_EARN_URL,
      notes: `${POINTS_PER_SEGMENT} points per segment${isAward ? " (award ticket: status points only)" : ""}`,
    };
  }

  if (isAward) {
    return {
      ...pooled,
      pool: "award",
      ruleName: "Price paid (award)",
      ruleUrl: CHOOSE_HOW_YOU_EARN_URL,
      notes: `1 status point per ${REDEEMED_POINTS_PER_STATUS_POINT} points redeemed, split across flights by distance`,
    };
  }

  if (usesRevenueEarning(segment.airline, options.ticketIssuer)) {
    return {
      ...pooled,
      pool: "revenue",
      ruleName: "Price paid",
      ruleUrl: PARTNER_EARN_CHART_URL,
      notes: `${POINTS_PER_DOLLAR} points per $1 (excluding taxes and fees), split across flights by distance`,
    };
  }

  if (ALASKA_GROUP_AIRLINES.has(segment.airline)) {
    throw new Error(
      "Alaska and Hawaiian flights on a partner-issued ticket aren't supported. Choose Alaska/Hawaiian (027) as the ticket issuer."
    );
  }

  const partnerFareClass = getPartnerCabin(segment.airline, segment.fareClass);
  if (!partnerFareClass) {
    throw new Error(
      `Fare class "${segment.fareClass.toUpperCase()}" isn't in Atmos Rewards' partner fare class table for ${segment.airline.toUpperCase()}`
    );
  }

  const chartCategory = toChartCategory(partnerFareClass.cabin, segment);
  const { base, bonus } = PARTNER_CHART[chartCategory];
  const totalPoints = Math.round(miles * (base + bonus));
  const basePoints = Math.round(miles * base);
  const earnsStatusPoints = !STATUS_POINTS_EXCLUDED_PARTNERS.has(segment.airline);

  return {
    miles,
    basePoints,
    cabinBonus: totalPoints - basePoints,
    statusPoints: earnsStatusPoints ? totalPoints : 0,
    chartCategory,
    ruleName: "Other partner earn chart",
    ruleUrl: PARTNER_EARN_CHART_URL,
    notes: `${CHART_CATEGORY_DISPLAY[chartCategory]}: ${Math.round((base + bonus) * 100)}% of distance flown${
      earnsStatusPoints ? "" : " (no status points when booked with this airline)"
    }`,
  };
};

// Splits a ticket-level total across the segments in that pool, weighted by distance
const distributePool = (
  bases: (BaseEarning | Error)[],
  pool: TicketPool,
  total: number,
  earnsAtmosPoints: boolean
) => {
  const pooled = bases.filter(
    (base): base is BaseEarning => !(base instanceof Error) && base.pool === pool
  );
  const shares = allocateByWeight(
    total,
    pooled.map((base) => base.miles)
  );
  pooled.forEach((base, idx) => {
    base.statusPoints = shares[idx];
    if (earnsAtmosPoints) {
      base.basePoints = shares[idx];
    }
  });
};

export const calculate = async (
  segments: Segment[],
  eliteStatus: string = "",
  programOptions: ProgramOptions = {}
): Promise<CalculationResult> => {
  const options = toAtmosOptions(programOptions);
  const eliteBonusMultiple = getEliteBonusMultiple(eliteStatus);

  const bases = segments.map((segment): BaseEarning | Error => {
    if (!ATMOS_SUPPORTED_AIRLINES.has(segment.airline)) {
      return new Error(
        `Atmos Rewards does not support earning on ${segment.airline.toUpperCase()}`
      );
    }
    try {
      return calculateBase(segment, calcDistance(segment.fromAirport, segment.toAirport), options);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  });

  distributePool(bases, "revenue", Math.floor(options.fareUsd * POINTS_PER_DOLLAR), true);
  distributePool(
    bases,
    "award",
    Math.floor(options.pointsRedeemed / REDEEMED_POINTS_PER_STATUS_POINT),
    false
  );

  const retval: CalculationResult = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  segments.forEach((segment, idx) => {
    const base = bases[idx];
    if (base instanceof Error) {
      retval.segmentResults.push({ segment, error: base });
      retval.containsErrors = true;
      return;
    }

    const eliteBonus = Math.round(base.basePoints * eliteBonusMultiple);
    const globalLocalsBonus =
      options.globalLocals && isOutsideUnitedStates(segment)
        ? Math.round(base.statusPoints * GLOBAL_LOCALS_BONUS)
        : 0;
    const airlinePoints = base.basePoints + base.cabinBonus + eliteBonus;
    const elitePoints = base.statusPoints + globalLocalsBonus;

    retval.segmentResults.push({
      segment,
      ruleName: base.ruleName,
      ruleUrl: base.ruleUrl,
      fareEarnCategory: base.chartCategory,
      notes: base.notes,
      airlinePoints,
      elitePoints,
      airlinePointsBreakdown: {
        basePoints: base.basePoints,
        cabinBonus: base.cabinBonus,
        eliteBonus: { airlinePoints: eliteBonus },
        totalEarned: airlinePoints,
      },
      elitePointsBreakdown: {
        basePoints: base.statusPoints,
        globalLocalsBonus,
      },
    });
    retval.airlinePoints += airlinePoints;
    retval.elitePoints += elitePoints;
  });

  return retval;
};
