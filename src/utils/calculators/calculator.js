import { getPartnerEarnCategory } from "./partner/partnerEarnCategories"
import { getPartnerRules } from "./partner/partnerRules"
import { getQantasEarnCategory } from "./qantas/qantasEarnCategories"
import { getQantasMinimumPoints, getQantasRules } from "./qantas/qantasRules"

// TODO make this a map of airline to rules?
const partnerRules = getPartnerRules() // this is a list
const qantasRules = getQantasRules() // this is a map of airlineCode -> rules[]
const qantasMinPoints = getQantasMinimumPoints()

const eliteStatusBonusAirlines = new Set(['aa', 'qf', 'jq', '3k', 'gk'])
const eliteStatusBonusMultiples = {
  'Silver': 0.50,
  'Gold': 0.75,
  'Platinum': 1.00,
  'Platinum One': 1.00,
}

export const calculate = (segments, eliteStatus) => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    statusCredits: 0,
    qantasPoints: 0
  }

  for (let segment of segments) {
    try {
      const segmentResult = calculateSegment(segment, eliteStatus);

      retval.segmentResults.push({
        segment,
        ...segmentResult
      });
      retval.qantasPoints += segmentResult.qantasPoints;
      retval.statusCredits += segmentResult.statusCredits;
    } catch (err) {
      retval.segmentResults.push({
        error: err,
        segment,
      })
      retval.containsErrors = true
    }
  }

  return retval
}

const calculateSegment = (segment, eliteStatus) => {
  const { fareEarnCategory, rule, minPoints } = getEarnCalculationRequirements(segment);

  if (!rule) {
    throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`);
  }

  const calculation = rule.calculate(segment, fareEarnCategory);

  const eliteBonus = calculateEliteBonusPoints(
    eliteStatus,
    segment,
    rule,
    fareEarnCategory
  );

  const qantasPointsBreakdown = {
    basePoints: calculation.qantasPoints,
    eliteBonus,
    minPoints,
    totalEarned: Math.max(
      calculation.qantasPoints + (eliteBonus?.qantasPoints || 0),
      (minPoints || 0)
    ),
  };

  return {
    rule,
    ruleUrl: calculation.ruleUrl,
    fareEarnCategory,
    notes: calculation.notes,
    statusCredits: calculation.statusCredits,
    qantasPoints: qantasPointsBreakdown.totalEarned,
    qantasPointsBreakdown,
  };
}

// TODO clean this up
const getEarnCalculationRequirements = (segment) => {
  if(segment.airline in qantasRules) {
    const fareEarnCategory = getQantasEarnCategory(segment)

    const rule = qantasRules[segment.airline].find( (rule) => {
      return rule.applies(segment, fareEarnCategory)
    })

    const minPoints = qantasMinPoints[segment.airline][fareEarnCategory]

    return {fareEarnCategory, rule, minPoints}
  } else {
    const fareEarnCategory = getPartnerEarnCategory(segment)

    const rule = partnerRules.find( (rule) => {
      return rule.applies(segment, fareEarnCategory)
    })

    return {fareEarnCategory, rule, minPoints: undefined}
  }
}

const calculateEliteBonusPoints = (eliteStatus, segment, rule, fareEarnCategory) => {
  if (
    !(
      eliteStatusBonusMultiples[eliteStatus] &&
      eliteStatusBonusAirlines.has(segment.airline)
    )
  ) {
    return {};
  }

  // elite bonus is calculated off of the flexible economy earnings, unless the earn category is economy or discount economy
  let fareEarnCategoryToUse = 'flexibleEconomy'
  if (fareEarnCategory === 'discountEconomy' || fareEarnCategory === 'economy') {
    fareEarnCategoryToUse = fareEarnCategory
  }

  const result = rule.calculate(segment, fareEarnCategoryToUse);
  return {
    eligibleFareCategory: fareEarnCategoryToUse,
    qantasPoints: Math.floor(
      result.qantasPoints * eliteStatusBonusMultiples[eliteStatus]
    ),
  };
}
