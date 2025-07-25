import { ALL_AIRLINES, ONEWORLD_AIRLINES } from '../../models/constants';
import { calcDistance } from '../../utils/airports';
import { calulateTotalDistance } from '../../utils/routes';
import { FINNAIR_FARE_CLASSES } from './constants';

// https://www.finnair.com/es-en/finnair-plus/collect-and-use-avios/collect-avios-and-tier-points-from-flights

const supportedAirlines = new Set([...Object.keys(ONEWORLD_AIRLINES)]);

const USD_TO_EURO = 0.9;

export const calculate = (segments, eliteStatus = '', priceLessTaxes = 0) => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  const totalDistance = calulateTotalDistance(segments);

  for (let segment of segments) {
    if (!supportedAirlines.has(segment.airline)) {
      retval.segmentResults.push({
        segment,
        error: new Error(`Finnair does not support earnings on ${segment.airline}`),
      });
      retval.containsErrors = true;
      break;
    }

    try {
      const segmentDistance = calcDistance(segment.fromAirport, segment.toAirport);
      const segmentPriceLessTaxes =
        priceLessTaxes * USD_TO_EURO * (segmentDistance / totalDistance);

      const segmentResult = calculateSegment(
        segment,
        eliteStatus.toLowerCase(),
        segmentPriceLessTaxes,
      );

      retval.segmentResults.push({
        segment,
        ...segmentResult,
      });
      retval.airlinePoints += segmentResult.airlinePoints;
      retval.elitePoints += segmentResult.airlinePoints;
    } catch (err) {
      retval.segmentResults.push({
        error: err,
        segment,
      });
      retval.containsErrors = true;
    }
  }

  // floor the points here (vs in each segment) so we better handle multi segment routes
  if (retval.airlinePoints) {
    retval.airlinePoints = Math.floor(retval.airlinePoints);
  }

  return retval;
};

const calculateSegment = (segment, eliteStatus, priceLessTaxes) => {
  const basePoints = calculateAirlinePoints(segment, priceLessTaxes);
  const eliteBonus = calculateAirlinePointsEliteBonus(segment, eliteStatus, priceLessTaxes);

  const airlinePointsBreakdown = {
    basePoints,
    eliteBonus: { airlinePoints: eliteBonus },
    totalEarned: Math.max(basePoints + (eliteBonus || 0)),
  };

  return {
    ruleName: ALL_AIRLINES[segment.airline],
    ruleUrl:
      'https://www.finnair.com/es-en/finnair-plus/collect-and-use-avios/collect-avios-and-tier-points-from-flights',
    elitePoints: airlinePointsBreakdown.totalEarned,
    airlinePoints: airlinePointsBreakdown.totalEarned,
    airlinePointsBreakdown,
  };
};

const calculateAirlinePoints = (segment) => {
  // if (segment.airline === 'ay') {
  //   return priceLessTaxes * 1.5;
  // }

  const segmentDistance = calcDistance(segment.fromAirport, segment.toAirport);

  if (!FINNAIR_FARE_CLASSES[segment.airline]) {
    throw new Error(`${segment.airline} not configured for Finnair earnings`);
  } else if (!(segment.fareClass in FINNAIR_FARE_CLASSES[segment.airline]['fare_class'])) {
    throw new Error(
      `${segment.airline} fare class ${segment.fareClass} not configured for Finnair earnings`,
    );
  }

  return Math.floor(
    FINNAIR_FARE_CLASSES[segment.airline]['fare_class'][segment.fareClass] * segmentDistance,
  );
};

const calculateAirlinePointsEliteBonus = (segment, eliteStatus) => {
  if (!FINNAIR_FARE_CLASSES[segment.airline]['status_multiplier']) {
    return 0;
  }

  const segmentDistance = calcDistance(segment.fromAirport, segment.toAirport);

  return segmentDistance * FINNAIR_FARE_CLASSES[segment.airline]['status_multiplier'][eliteStatus];
};
