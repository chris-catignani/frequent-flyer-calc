import { AIRLINES } from '../../models/constants';
import { calcDistance } from '../../utils/airports';
import { MALAYSIA_FARE_CLASSES, MALAYSIA_RULE_URLS } from './constants';

export const calculate = (segments, eliteStatus = '') => {
  const retval = {
    segmentResults: [],
    containsErrors: false,
    elitePoints: 0,
    airlinePoints: 0,
  };

  for (let segment of segments) {
    try {
      const segmentResult = calculateSegment(segment, eliteStatus.toLowerCase());

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

  return retval;
};

const calculateSegment = (segment) => {
  const basePoints = calculateAirlinePoints(segment);
  const eliteBonus = {};

  const airlinePointsBreakdown = {
    basePoints,
    eliteBonus,
    totalEarned: Math.max(basePoints + (eliteBonus?.airlinePoints || 0)),
  };

  return {
    ruleName: AIRLINES[segment.airline],
    ruleUrl: MALAYSIA_RULE_URLS[segment.airline],
    elitePoints: calculateElitePoints(segment),
    airlinePoints: airlinePointsBreakdown.totalEarned,
    airlinePointsBreakdown,
  };
};

const calculateAirlinePoints = (segment) => {
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
