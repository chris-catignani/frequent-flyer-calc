import { isInRegion } from "@/calculators/qantas/regions";
import type { Segment } from "@/models/segment";
import type { Airport } from "@/types/airport";

export interface FareBucketRule {
  all?: boolean;
  notSupported?: { reason: string };
  categories: Record<string, string>;
  origin?: {
    country?: Set<string>;
    region?: Set<string>;
  };
  destination?: {
    country?: Set<string>;
    region?: Set<string>;
  };
}

export interface EarnCategoryConfig {
  fareBuckets: {
    rules: FareBucketRule[];
  };
}

export type EarnCategoryMap = Record<string, EarnCategoryConfig>;

/**
 * Taking the copy/paste fare buckets from the Qantas website and parse them.
 */
export const buildFareBuckets = (
  qantasString: string,
  fareClasses: string[]
): Record<string, string> => {
  // remove all '*', replace whitespace with single space, split on that single space
  const fareBuckets = qantasString
    .trim()
    .replace(/[*~^#]/gm, "")
    .replace(/\s+/gm, " ")
    .toLowerCase()
    .split(" ");
  const retval: Record<string, string> = {};

  fareClasses.forEach((fareClass, index) => {
    if (fareBuckets[index] === "-") {
      return;
    }

    // iterate over each single fareClass character, putting that character and fare category into the map
    fareBuckets[index]?.split("").forEach((fareBucket) => (retval[fareBucket] = fareClass));
  });

  return retval;
};

export const buildSimpleFareBuckets = (
  qantasString: string,
  fareClasses: string[]
): { rules: FareBucketRule[] } => {
  return {
    rules: [
      {
        all: true,
        categories: buildFareBuckets(qantasString, fareClasses),
      },
    ],
  };
};

export const getEarnCategory = (segment: Segment, earnCategories: EarnCategoryMap): string => {
  if (!earnCategories[segment.airline]) {
    throw new Error(`No airline configured for ${segment.airline}`);
  }

  for (const rule of earnCategories[segment.airline].fareBuckets.rules) {
    if (!isApplicableRule(segment, rule)) {
      continue;
    }

    if (rule.notSupported) {
      throw new Error(rule.notSupported.reason);
    }

    if (!rule.categories[segment.fareClass]) {
      throw new Error(
        `Airline ${segment.airline} is not configured for fare class ${segment.fareClass}`
      );
    }

    return rule.categories[segment.fareClass];
  }

  throw new Error(
    `No applicable earn category rule found for ${segment.airline} ${segment.fareClass}`
  );
};

const isApplicableRule = (segment: Segment, rule: FareBucketRule): boolean => {
  const check = (
    originAirport: Airport,
    destinationAirport: Airport,
    rule: FareBucketRule
  ): boolean => {
    if (rule.all) {
      return true;
    }

    let originApplies = false;
    let destinationApplies = false;

    if (rule.origin?.country) {
      originApplies = rule.origin.country.has(originAirport.country.toLowerCase());
    }

    if (!originApplies && rule.origin?.region) {
      for (const region of rule.origin.region) {
        if (isInRegion(originAirport.iata.toLowerCase(), region)) {
          originApplies = true;
          break;
        }
      }
    }

    if (rule.destination?.country) {
      destinationApplies = rule.destination.country.has(destinationAirport.country.toLowerCase());
    }

    if (!destinationApplies && rule.destination?.region) {
      for (const region of rule.destination.region) {
        if (isInRegion(destinationAirport.iata.toLowerCase(), region)) {
          destinationApplies = true;
          break;
        }
      }
    }

    return originApplies && destinationApplies;
  };

  return (
    check(segment.fromAirport, segment.toAirport, rule) ||
    check(segment.toAirport, segment.fromAirport, rule)
  );
};
