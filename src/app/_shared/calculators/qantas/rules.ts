import { calcDistance } from "@/app/_shared/utils/airports";
import { isInRegion } from "@/app/_shared/calculators/qantas/regions";
import { Earnings } from "@/app/_shared/models/earnings";
import { REGION_DISPLAY } from "@/app/_shared/models/qantasConstants";
import type { Segment } from "@/app/_shared/models/segment";
import type { Airport } from "@/types/airport";
import type { RuleCalculationReturn } from "@/types/calculator";

export interface DistanceBand {
  minDistance: number;
  maxDistance?: number;
  earnings: Record<string, Earnings>;
}

export interface FareClassEarningDetail {
  calculationNotes: string;
  airlinePoints: number;
  elitePoints: number;
}

export type FareClassEarnings = Record<string, FareClassEarningDetail>;

export interface GeographicalLocation {
  type: "airport" | "city" | "country" | "region";
  value: string;
}

export interface GeographicalRuleConfig {
  origin: {
    city?: Set<string>;
    country?: Set<string>;
    region?: Set<string>;
  };
  destination: {
    city?: Record<string, Record<string, Earnings>>;
    country?: Record<string, Record<string, Earnings>>;
    region?: Record<string, Record<string, Earnings>>;
  };
}

/**
 * All rules should implement these methods
 */
export class Rule {
  name: string;
  ruleUrl: string;
  minPoints?: Record<string, number> | null;

  constructor(name: string, ruleUrl: string, minPoints: Record<string, number> | null = null) {
    this.name = name;
    this.ruleUrl = ruleUrl;
    this.minPoints = minPoints;
  }

  // Some routes publish their own minimum points guarantee that overrides the
  // airline's general one (e.g. Jetstar Domestic New Zealand). Returns
  // undefined when this rule doesn't define a route-specific override.
  getMinPoints(fareEarnCategory: string): number | undefined {
    return this.minPoints?.[fareEarnCategory];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applies(segment: Segment, fareEarnCategory: string): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculate(segment: Segment, fareEarnCategory: string): RuleCalculationReturn {
    return this.buildCalculationReturn("", "", 0, 0);
  }

  buildCalculationReturn(
    fareEarnCategory: string,
    notes: string,
    airlinePoints: number,
    elitePoints: number
  ): RuleCalculationReturn {
    return {
      rule: this.name,
      ruleUrl: this.ruleUrl,
      fareEarnCategory,
      notes,
      airlinePoints,
      elitePoints,
    };
  }
}

export class IntraCountryRule extends Rule {
  country: string;
  distanceRule: DistanceRule;

  constructor(name: string, ruleUrl: string, country: string, distanceBands: DistanceBand[]) {
    super(name, ruleUrl);
    this.country = country;
    this.distanceRule = new DistanceRule(name, ruleUrl, distanceBands);
  }

  applies(segment: Segment, fareEarnCategory: string): boolean {
    if (
      segment.fromAirport.country !== this.country ||
      segment.toAirport.country !== this.country
    ) {
      return false;
    }

    return this.distanceRule.applies(segment, fareEarnCategory);
  }

  calculate(segment: Segment, fareEarnCategory: string): RuleCalculationReturn {
    return this.distanceRule.calculate(segment, fareEarnCategory);
  }
}

/**
 * Distance based rule
 */
export class DistanceRule extends Rule {
  distanceBands: DistanceBand[];

  constructor(name: string, ruleUrl: string, distanceBands: DistanceBand[]) {
    super(name, ruleUrl);
    this.distanceBands = distanceBands;
  }

  _getDistanceBand(distance: number): DistanceBand | undefined {
    return this.distanceBands.find((distanceBand) => {
      return (
        distanceBand.minDistance < distance &&
        (!("maxDistance" in distanceBand) || distance <= distanceBand.maxDistance!)
      );
    });
  }

  applies(segment: Segment, fareEarnCategory: string): boolean {
    const distance = calcDistance(segment.fromAirport, segment.toAirport);
    const distanceBand = this._getDistanceBand(distance);
    if (!distanceBand) {
      return false;
    }

    return fareEarnCategory in distanceBand.earnings;
  }

  calculate(segment: Segment, fareEarnCategory: string): RuleCalculationReturn {
    const distance = calcDistance(segment.fromAirport, segment.toAirport);

    const distanceBand = this._getDistanceBand(distance);
    if (!distanceBand) {
      throw new Error("No applicable distance band to calculate with for rule: " + this.name);
    }

    const notesForDistance =
      "maxDistance" in distanceBand
        ? `using band ${distanceBand.minDistance} - ${distanceBand.maxDistance}`
        : `using band ${distanceBand.minDistance} and over`;

    return this.buildCalculationReturn(
      fareEarnCategory,
      `Distance calculated to ${distance} miles, ${notesForDistance}`,
      distanceBand.earnings[fareEarnCategory].airlinePoints,
      distanceBand.earnings[fareEarnCategory].elitePoints
    );
  }
}

export class FareClassRule extends Rule {
  fareClassEarnings: FareClassEarnings;

  constructor(name: string, ruleUrl: string, fareClassEarnings: FareClassEarnings) {
    super(name, ruleUrl);
    this.fareClassEarnings = fareClassEarnings;
  }

  applies(segment: Segment, fareEarnCategory: string): boolean {
    return fareEarnCategory in this.fareClassEarnings;
  }

  calculate(segment: Segment, fareEarnCategory: string): RuleCalculationReturn {
    return this.buildCalculationReturn(
      fareEarnCategory,
      this.fareClassEarnings[fareEarnCategory].calculationNotes,
      this.fareClassEarnings[fareEarnCategory].airlinePoints,
      this.fareClassEarnings[fareEarnCategory].elitePoints
    );
  }
}

/**
 * Rule for Geographical pairings.
 */
export class GeographicalRule extends Rule {
  ruleConfig: GeographicalRuleConfig;

  constructor(
    name: string,
    ruleUrl: string,
    ruleConfig: GeographicalRuleConfig,
    minPoints: Record<string, number> | null = null
  ) {
    super(name, ruleUrl, minPoints);
    this.ruleConfig = ruleConfig;
  }

  _getOrigin(airport: Airport): GeographicalLocation | null {
    if (this.ruleConfig.origin.city) {
      if (this.ruleConfig.origin.city.has(airport.city.toLowerCase())) {
        return { type: "city", value: airport.city.toLowerCase() };
      }
    }

    if (this.ruleConfig.origin.country) {
      if (this.ruleConfig.origin.country.has(airport.country.toLowerCase())) {
        return { type: "country", value: airport.country.toLowerCase() };
      }
    }

    if (this.ruleConfig.origin.region) {
      for (const region of this.ruleConfig.origin.region.values()) {
        if (isInRegion(airport.iata.toLowerCase(), region)) {
          return { type: "region", value: region };
        }
      }
    }

    return null;
  }

  _getDestination(airport: Airport): GeographicalLocation | null {
    if (this.ruleConfig.destination.city) {
      if (airport.city.toLowerCase() in this.ruleConfig.destination.city) {
        return { type: "city", value: airport.city.toLowerCase() };
      }
    }

    if (this.ruleConfig.destination.country) {
      if (airport.country.toLowerCase() in this.ruleConfig.destination.country) {
        return { type: "country", value: airport.country.toLowerCase() };
      }
    }

    if (this.ruleConfig.destination.region) {
      for (const region of Object.keys(this.ruleConfig.destination.region)) {
        if (isInRegion(airport.iata.toLowerCase(), region)) {
          return { type: "region", value: region };
        }
      }
    }

    return null;
  }

  _getOriginAndDestination(segment: Segment): {
    origin: GeographicalLocation | null;
    destination: GeographicalLocation | null;
  } {
    let origin = this._getOrigin(segment.fromAirport);
    let destination = this._getDestination(segment.toAirport);

    if (!origin || !destination) {
      origin = this._getOrigin(segment.toAirport);
      destination = this._getDestination(segment.fromAirport);
    }

    return { origin, destination };
  }

  _buildCalculationNotes(origin: GeographicalLocation, destination: GeographicalLocation): string {
    const _buildCalculationNotesInner = (location: GeographicalLocation): string => {
      if (location.type === "airport") {
        return `${location.value} airport`;
      } else if (location.type === "city") {
        return location.value;
      } else if (location.type === "country") {
        return location.value;
      } else if (location.type === "region") {
        return REGION_DISPLAY[location.value] || location.value;
      } else {
        throw new Error(
          `Cannot create calcluation notes for unknown type ${(location as GeographicalLocation).type}`
        );
      }
    };

    return _buildCalculationNotesInner(origin) + " to " + _buildCalculationNotesInner(destination);
  }

  applies(segment: Segment, fareEarnCategory: string): boolean {
    const { origin, destination } = this._getOriginAndDestination(segment);
    if (!origin || !destination) {
      return false;
    }

    const earningsMap =
      this.ruleConfig.destination[destination.type as "city" | "country" | "region"];
    const earnings = earningsMap?.[destination.value];
    return Boolean(earnings && fareEarnCategory in earnings);
  }

  calculate(segment: Segment, fareEarnCategory: string): RuleCalculationReturn {
    const { origin, destination } = this._getOriginAndDestination(segment);
    if (!origin || !destination) {
      throw new Error(
        `Cannot calculate geographical rule without origin and destination for ${this.name}`
      );
    }
    const earningsMap =
      this.ruleConfig.destination[destination.type as "city" | "country" | "region"];
    const earnings = earningsMap?.[destination.value];

    if (!earnings || !earnings[fareEarnCategory]) {
      throw new Error(`No earnings found for ${fareEarnCategory} in rule ${this.name}`);
    }

    return this.buildCalculationReturn(
      fareEarnCategory,
      this._buildCalculationNotes(origin, destination),
      earnings[fareEarnCategory].airlinePoints,
      earnings[fareEarnCategory].elitePoints
    );
  }
}

// Qantas's own published tables occasionally use a '.' instead of ',' as the
// thousands separator (a typo on their end, e.g. "1.450" meaning 1,450) - strip
// both so a re-copy-paste of their data doesn't silently parse to the wrong number.
export const parseEarningRates = (
  airlinePointsString: string,
  qantasCreditsString: string,
  fareClasses: string[]
): Record<string, Earnings> => {
  const pointsPerFareclass = airlinePointsString
    .trim()
    .replace(/[,.]/gm, "")
    .replace(/\s+/gm, " ")
    .split(" ");
  const creditsPerFareclass = qantasCreditsString
    .trim()
    .replace(/[,.]/gm, "")
    .replace(/\s+/gm, " ")
    .split(" ");
  const retval: Record<string, Earnings> = {};

  fareClasses.forEach((fareClass, index) => {
    retval[fareClass] = new Earnings(
      parseInt(pointsPerFareclass[index]) || 0,
      parseInt(creditsPerFareclass[index]) || 0
    );
  });

  return retval;
};
