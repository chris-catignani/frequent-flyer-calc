import { fetchDataFromQantas } from './qantasAPI/qantasAPIClient';
import { getPartnerRules } from './partner/partnerRules';
import { getQantasEarnCategory } from './qantas/qantasEarnCategories';
import { getQantasMinimumPoints, getQantasRules } from './qantas/qantasRules';
import { getPartnerEarnCategory, qualifiesForElitePoints } from './partner/partnerEarnCategories';
import { LATAM_AIRLINES, ONEWORLD_AIRLINES } from '../../models/constants';
import { JAL_AIRLINES, JETSTAR_AIRLINES } from '../../models/qantasConstants';

// TODO make this a map of airline to rules?
const partnerRules = getPartnerRules(); // this is a list
const qantasRules = getQantasRules(); // this is a map of airlineCode -> rules[]
const qantasMinPoints = getQantasMinimumPoints();

const supportedAirlines = new Set([
  ...Object.keys(ONEWORLD_AIRLINES),
  ...Object.keys(LATAM_AIRLINES),
  ...JETSTAR_AIRLINES,
  ...JAL_AIRLINES,
  'af',
  'nf',
  'mu',
  'ly',
  'ek',
  'kl',
  'ws',
]);

const eliteStatusBonusAirlines = new Set(['aa', 'qf', 'jq', '3k', 'gk']);
const eliteStatusBonusMultiples = {
  silver: 0.5,
  gold: 0.75,
  platinum: 1.0,
  'platinum one': 1.0,
};

export const calculate = async (
  segments,
  eliteStatus = '',
  priceLessTaxes = 0, // eslint-disable-line
  compareWithQantasCalc = false,
) => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  for (let segment of segments) {
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

const calculateSegment = (segment, eliteStatus) => {
  const { fareEarnCategory, rule, minPoints, earnsElitePoints } =
    getEarnCalculationRequirements(segment);

  if (!rule) {
    throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`);
  }

  const calculation = rule.calculate(segment, fareEarnCategory);

  let eliteBonus = {};

  if (eliteStatusBonusMultiples[eliteStatus] && eliteStatusBonusAirlines.has(segment.airline)) {
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
const getEarnCalculationRequirements = (segment) => {
  if (segment.airline in qantasRules) {
    const fareEarnCategory = getQantasEarnCategory(segment);

    const rule = qantasRules[segment.airline].find((rule) => {
      return rule.applies(segment, fareEarnCategory);
    });

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
