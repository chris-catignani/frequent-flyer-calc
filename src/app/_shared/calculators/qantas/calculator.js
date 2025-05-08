import { fetchDataFromQantas } from './qantasAPI/qantasAPIClient';
import { getPartnerRules } from './partner/partnerRules';
import { getQantasEarnCategory } from './qantas/qantasEarnCategories';
import { getQantasMinimumPoints, getQantasRules } from './qantas/qantasRules';
import { getPartnerEarnCategory, qualifiesForElitePoints } from './partner/partnerEarnCategories';

// TODO make this a map of airline to rules?
const partnerRules = getPartnerRules(); // this is a list
const qantasRulesPreJuly2025 = getQantasRules(true); // this is a map of airlineCode -> rules[]
const qantasRules = getQantasRules(false); // this is a map of airlineCode -> rules[]
const qantasMinPoints = getQantasMinimumPoints();

const eliteStatusBonusAirlines = new Set(['aa', 'qf', 'jq', '3k', 'gk']);
const eliteStatusBonusMultiples = {
  silver: 0.5,
  gold: 0.75,
  platinum: 1.0,
  'platinum one': 1.0,
};

export const calculate = async (
  segments,
  eliteStatus,
  compareWithQantasCalc = false,
  preJuly2025 = true,
) => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  for (let segment of segments) {
    try {
      const segmentResult = calculateSegment(segment, eliteStatus.toLowerCase(), preJuly2025);

      let qantasAPIResults = {};
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

const getDataFromQantasCalc = async (segment, eliteStatus) => {
  let fareEarnCategory = null;
  if (segment.airline in qantasRules) {
    fareEarnCategory = getQantasEarnCategory(segment);
  } else {
    fareEarnCategory = getPartnerEarnCategory(segment);
  }

  return await fetchDataFromQantas(segment, eliteStatus, fareEarnCategory);
};

const calculateSegment = (segment, eliteStatus, preJuly2025) => {
  const { fareEarnCategory, rule, minPoints, earnsElitePoints } = getEarnCalculationRequirements(
    segment,
    preJuly2025,
  );

  if (!rule) {
    throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`);
  }

  const calculation = rule.calculate(segment, fareEarnCategory);

  let eliteBonus = {};

  if (preJuly2025) {
    eliteBonus = calculateEliteBonusPoints(eliteStatus, segment, rule, fareEarnCategory);
  } else if (
    eliteStatusBonusMultiples[eliteStatus] &&
    eliteStatusBonusAirlines.has(segment.airline)
  ) {
    eliteBonus = {
      eligibleFareCategory: fareEarnCategory,
      airlinePoints: Math.floor(calculation.airlinePoints * eliteStatusBonusMultiples[eliteStatus]),
    };
  }

  const airlinePointsBreakdown = {
    basePoints: calculation.airlinePoints,
    eliteBonus,
    minPoints,
    totalEarned: Math.max(
      calculation.airlinePoints + (eliteBonus?.airlinePoints || 0),
      minPoints || 0,
    ),
  };

  return {
    ruleName: rule.name,
    ruleUrl: calculation.ruleUrl,
    fareEarnCategory,
    notes: calculation.notes,
    elitePoints: earnsElitePoints ? calculation.elitePoints : 0,
    airlinePoints: airlinePointsBreakdown.totalEarned,
    airlinePointsBreakdown,
  };
};

// TODO clean this up
const getEarnCalculationRequirements = (segment, preJuly2025) => {
  if (segment.airline in qantasRules) {
    const fareEarnCategory = getQantasEarnCategory(segment);

    let rule = undefined;
    if (preJuly2025) {
      rule = qantasRulesPreJuly2025[segment.airline].find((rule) => {
        return rule.applies(segment, fareEarnCategory);
      });
    } else {
      rule = qantasRules[segment.airline].find((rule) => {
        return rule.applies(segment, fareEarnCategory);
      });
    }

    const minPoints = qantasMinPoints[segment.airline][fareEarnCategory];

    return { fareEarnCategory, rule, minPoints, earnsElitePoints: true };
  } else {
    const fareEarnCategory = getPartnerEarnCategory(segment);

    const rule = partnerRules.find((rule) => {
      return rule.applies(segment, fareEarnCategory);
    });

    const earnsElitePoints = qualifiesForElitePoints(segment);

    return { fareEarnCategory, rule, minPoints: undefined, earnsElitePoints };
  }
};

const calculateEliteBonusPoints = (eliteStatus, segment, rule, fareEarnCategory) => {
  if (!(eliteStatusBonusMultiples[eliteStatus] && eliteStatusBonusAirlines.has(segment.airline))) {
    return {};
  }

  // elite bonus is calculated off of the flexible economy earnings, unless the earn category is economy or discount economy
  let fareEarnCategoryToUse = 'flexibleEconomy';
  if (fareEarnCategory === 'discountEconomy' || fareEarnCategory === 'economy') {
    fareEarnCategoryToUse = fareEarnCategory;
  }

  const result = rule.calculate(segment, fareEarnCategoryToUse);
  return {
    eligibleFareCategory: fareEarnCategoryToUse,
    airlinePoints: Math.ceil(result.airlinePoints * eliteStatusBonusMultiples[eliteStatus]),
  };
};
