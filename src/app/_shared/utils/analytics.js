import { track } from '@vercel/analytics';

/**
 * Safely dispatches a custom event to Vercel Analytics, ignoring any errors or rejections.
 * @param {string} eventName
 * @param {Record<string, string | number | boolean | null | undefined>} properties
 */
function safeTrack(eventName, properties) {
  try {
    const res = track(eventName, properties);
    if (res && typeof res.catch === 'function') {
      res.catch(() => {});
    }
  } catch {
    // Suppress errors so telemetry never affects user application flow
  }
}

/**
 * Tracks a completed calculation event.
 * @param {Object} params
 * @param {Array} [params.segmentResults=[]]
 * @param {string} [params.tripType='one way']
 * @param {string} [params.eliteStatus='Bronze']
 * @param {boolean} [params.compareWithQantas=false]
 * @param {boolean} [params.containsErrors=false]
 * @param {number} [params.totalPoints=0]
 * @param {number} [params.totalStatusCredits=0]
 */
export function trackCalculationCompleted({
  segmentResults = [],
  tripType = 'one way',
  eliteStatus = 'Bronze',
  compareWithQantas = false,
  containsErrors = false,
  totalPoints = 0,
  totalStatusCredits = 0,
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
    trip_type: tripType ? String(tripType) : 'one way',
    elite_status: eliteStatus ? String(eliteStatus) : 'Bronze',
    segment_count: Number(segmentResults.length) || 0,
    total_points: Number(totalPoints) || 0,
    total_status_credits: Number(totalStatusCredits) || 0,
    compare_with_qantas: Boolean(compareWithQantas),
    contains_errors: Boolean(containsErrors),
  });
}

/**
 * Tracks a mismatch or error between our calculation results and Qantas API results for a segment.
 * @param {Object} [params={}]
 * @param {Object} [params.segment]
 * @param {number} [params.ourPoints=0]
 * @param {number} [params.ourStatusCredits=0]
 * @param {number|null} [params.qantasPoints=null]
 * @param {number|null} [params.qantasStatusCredits=null]
 * @param {string|null} [params.qantasError=null]
 * @param {string} [params.eliteStatus='Bronze']
 * @param {string} [params.tripType='one way']
 */
export function trackQantasApiMismatch({
  segment,
  ourPoints = 0,
  ourStatusCredits = 0,
  qantasPoints = null,
  qantasStatusCredits = null,
  qantasError = null,
  eliteStatus = 'Bronze',
  tripType = 'one way',
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
    elite_status: eliteStatus ? String(eliteStatus) : 'Bronze',
    trip_type: tripType ? String(tripType) : 'one way',
    our_points: Number(ourPoints) || 0,
    our_status_credits: Number(ourStatusCredits) || 0,
    qantas_points:
      qantasPoints !== null && qantasPoints !== undefined ? Number(qantasPoints) : null,
    qantas_status_credits:
      qantasStatusCredits !== null && qantasStatusCredits !== undefined
        ? Number(qantasStatusCredits)
        : null,
    qantas_error: qantasError ? String(qantasError).slice(0, 255) : null,
  });
}
