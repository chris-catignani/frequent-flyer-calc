import posthog from 'posthog-js';

/**
 * Safely dispatches a custom event to PostHog, ignoring any errors or rejections.
 * @param {string} eventName
 * @param {Record<string, string | number | boolean | null | undefined>} properties
 */
function safeTrack(eventName, properties) {
  try {
    if (typeof posthog?.capture === 'function') {
      posthog.capture(eventName, properties);
    }
  } catch {
    // Suppress errors so telemetry never affects user application flow
  }
}

/**
 * Tracks a completed calculation event.
 * @param {Object} params
 * @param {Array} [params.segmentResults]
 * @param {string} params.tripType
 * @param {string} params.eliteStatus
 * @param {boolean} params.compareWithQantas
 * @param {boolean} params.containsErrors
 * @param {number} params.totalPoints
 * @param {number} params.totalStatusCredits
 */
export function trackCalculationCompleted({
  segmentResults = [],
  tripType,
  eliteStatus,
  compareWithQantas,
  containsErrors,
  totalPoints,
  totalStatusCredits,
} = {}) {
  const routes = [];
  const airportSet = new Set();
  const airlineSet = new Set();

  segmentResults.forEach((result) => {
    const segment = result?.segment;
    if (!segment) return;

    const fromIata = segment.fromAirport?.iata ? segment.fromAirport.iata.toUpperCase() : '';
    const toIata = segment.toAirport?.iata ? segment.toAirport.iata.toUpperCase() : '';
    const airline = segment.airline ? segment.airline.toUpperCase() : '';

    if (fromIata && toIata) {
      routes.push(`${fromIata}-${toIata}`);
    }
    if (fromIata) airportSet.add(fromIata);
    if (toIata) airportSet.add(toIata);
    if (airline) airlineSet.add(airline);
  });

  safeTrack('calculation_completed', {
    route: routes.join(', ').slice(0, 255),
    airports: Array.from(airportSet).join(', ').slice(0, 255),
    airlines: Array.from(airlineSet).join(', ').slice(0, 255),
    trip_type: tripType,
    elite_status: eliteStatus,
    segment_count: segmentResults.length,
    total_points: totalPoints,
    total_status_credits: totalStatusCredits,
    compare_with_qantas: Boolean(compareWithQantas),
    contains_errors: Boolean(containsErrors),
  });
}

/**
 * Tracks a mismatch or error between our calculation results and Qantas API results for a segment.
 * @param {Object} params
 * @param {Object} params.segment
 * @param {number} params.ourPoints
 * @param {number} params.ourStatusCredits
 * @param {number|null} [params.qantasPoints]
 * @param {number|null} [params.qantasStatusCredits]
 * @param {string|null} [params.qantasError]
 * @param {string} params.eliteStatus
 * @param {string} params.tripType
 */
export function trackQantasApiMismatch({
  segment,
  ourPoints,
  ourStatusCredits,
  qantasPoints = null,
  qantasStatusCredits = null,
  qantasError = null,
  eliteStatus,
  tripType,
} = {}) {
  const fromIata = segment?.fromAirport?.iata ? segment.fromAirport.iata.toUpperCase() : '';
  const toIata = segment?.toAirport?.iata ? segment.toAirport.iata.toUpperCase() : '';
  const airline = segment?.airline ? segment.airline.toUpperCase() : '';
  const fareClass = segment?.fareClass ? segment.fareClass.toUpperCase() : '';

  const route = fromIata && toIata ? `${fromIata}-${toIata}` : '';

  safeTrack('qantas_api_mismatch', {
    route,
    airline,
    fare_class: fareClass,
    elite_status: eliteStatus,
    trip_type: tripType,
    our_points: ourPoints,
    our_status_credits: ourStatusCredits,
    qantas_points: qantasPoints,
    qantas_status_credits: qantasStatusCredits,
    qantas_error: qantasError,
  });
}
