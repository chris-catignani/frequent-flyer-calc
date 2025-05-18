import { ALL_AIRLINES, ONEWORLD_AIRLINES } from '../../models/constants';
import { calcDistance } from '../../utils/airports';
import { calulateTotalDistance } from '../../utils/routes';
import { MALAYSIA_FARE_CLASSES, MALAYSIA_RULE_URLS } from './constants';

const supportedAirlines = new Set([...Object.keys(ONEWORLD_AIRLINES)]);

const USD_TO_MYR = 4.4;

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
        error: new Error(`Malaysia airlines does not support earnings on ${segment.airline}`),
      });
      retval.containsErrors = true;
      break;
    }

    try {
      const segmentDistance = calcDistance(segment.fromAirport, segment.toAirport);
      const segmentPriceLessTaxes = priceLessTaxes * USD_TO_MYR * (segmentDistance / totalDistance);

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
      retval.elitePoints += segmentResult.elitePoints;
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
    ruleUrl: MALAYSIA_RULE_URLS[segment.airline],
    elitePoints: calculateElitePoints(segment),
    airlinePoints: airlinePointsBreakdown.totalEarned,
    airlinePointsBreakdown,
  };
};

const calculateAirlinePoints = (segment, priceLessTaxes) => {
  if (segment.airline === 'mh') {
    return priceLessTaxes * 1.5;
  }

  const segmentDistance = calcDistance(segment.fromAirport, segment.toAirport);

  if (!MALAYSIA_FARE_CLASSES[segment.airline]) {
    throw new Error(`${segment.airline} not configured for malaysia airlines earnings`);
  } else if (!(segment.fareClass in MALAYSIA_FARE_CLASSES[segment.airline]['earning'])) {
    throw new Error(
      `${segment.airline} fare class ${segment.fareClass} not configured for malaysia airlines earnings`,
    );
  }

  return Math.floor(
    MALAYSIA_FARE_CLASSES[segment.airline]['earning'][segment.fareClass] * segmentDistance,
  );
};

const calculateAirlinePointsEliteBonus = (segment, eliteStatus, priceLessTaxes) => {
  if (segment.airline !== 'mh' || !eliteStatus || eliteStatus === 'blue') {
    return 0;
  } else if (eliteStatus === 'silver') {
    return priceLessTaxes * (1.6 - 1.5);
  } else if (eliteStatus === 'gold') {
    return priceLessTaxes * (2.0 - 1.5);
  } else if (eliteStatus === 'platinum') {
    return priceLessTaxes * (2.2 - 1.5);
  }

  throw new Error(`Invalid Malaysia airlines elite status: ${eliteStatus}`);
};

const calculateElitePoints = (segment) => {
  const distance = calcDistance(segment.fromAirport, segment.toAirport);

  const calcElitePoints = (
    airline,
    fareClass,
    economyEarnings,
    businessEarnings,
    firstEarnings,
  ) => {
    const fareCategory = MALAYSIA_FARE_CLASSES[airline]['fare_class'][fareClass];

    if (fareCategory === 'none') {
      return 0;
    } else if (!fareCategory) {
      throw Error(airline + ' w/ fareclass ' + fareClass + ' calc not supported for malaysia yet');
    }

    if (fareCategory === 'economy') {
      return economyEarnings;
    } else if (fareCategory === 'business') {
      return businessEarnings;
    } else if (fareCategory === 'first') {
      return firstEarnings;
    } else {
      throw Error(
        "Couldn't determine fare category for " + airline + ' w/ fare class ' + fareClass,
      );
    }
  };

  if (distance <= 500) {
    return calcElitePoints(segment.airline, segment.fareClass, 1, 2, 3);
  } else if (distance <= 1200) {
    return calcElitePoints(segment.airline, segment.fareClass, 2, 3, 4);
  } else if (distance <= 2200) {
    return calcElitePoints(segment.airline, segment.fareClass, 3, 5, 6);
  } else if (distance <= 3500) {
    return calcElitePoints(segment.airline, segment.fareClass, 4, 6, 8);
  } else if (distance <= 5500) {
    return calcElitePoints(segment.airline, segment.fareClass, 6, 8, 10);
  } else if (distance <= 8000) {
    return calcElitePoints(segment.airline, segment.fareClass, 8, 10, 12);
  } else {
    return calcElitePoints(segment.airline, segment.fareClass, 8, 10, 12);
  }
};
