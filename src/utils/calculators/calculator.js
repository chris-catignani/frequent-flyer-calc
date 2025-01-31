import { fetchDataFromQantas } from "./qantasAPI/qantasAPIClient"
import { getPartnerEarnCategory, qualifiesForStatusCredits } from "./partner/partnerEarnCategories"
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

export const calculate = async (segments, eliteStatus, compareWithQantasCalc=false) => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    statusCredits: 0,
    qantasPoints: 0
  }

  for (let segment of segments) {
    try {
      const segmentResult = calculateSegment(segment, eliteStatus);

      let qantasAPIResults = {}
      if (compareWithQantasCalc) {
        qantasAPIResults = await getDataFromQantasCalc(segment, eliteStatus);
      }

      retval.segmentResults.push({
        segment,
        ...segmentResult,
        qantasAPIResults,
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

const getDataFromQantasCalc = async (segment, eliteStatus) => {
  let fareEarnCategory = null
  if (segment.airline in qantasRules) {
    fareEarnCategory = getQantasEarnCategory(segment);
  } else {
    fareEarnCategory = getPartnerEarnCategory(segment);
  }

  return await fetchDataFromQantas(segment, eliteStatus, fareEarnCategory);
}

const calculateSegment = (segment, eliteStatus) => {
  const { fareEarnCategory, rule, minPoints, earnsStatusCredits } = getEarnCalculationRequirements(segment);

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
    ruleName: rule.name,
    ruleUrl: calculation.ruleUrl,
    fareEarnCategory,
    notes: calculation.notes,
    statusCredits: earnsStatusCredits ? calculation.statusCredits : 0,
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

    return {fareEarnCategory, rule, minPoints, earnsStatusCredits: true}
  } else {
    const fareEarnCategory = getPartnerEarnCategory(segment)

    const rule = partnerRules.find( (rule) => {
      return rule.applies(segment, fareEarnCategory)
    })

    const earnsStatusCredits = qualifiesForStatusCredits(segment);

    return {fareEarnCategory, rule, minPoints: undefined, earnsStatusCredits}
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
    qantasPoints: Math.ceil(
      result.qantasPoints * eliteStatusBonusMultiples[eliteStatus]
    ),
  };
}
