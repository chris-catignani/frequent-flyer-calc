import posthog from "posthog-js";
import type { SegmentResult } from "@/types/calculator";
import type { Segment } from "@/app/_shared/models/segment";

export interface CalculationCompletedParams {
  segmentResults?: SegmentResult[];
  tripType?: string;
  eliteStatus?: string;
  compareWithQantas?: boolean;
  containsErrors?: boolean;
  totalPoints?: number;
  totalStatusCredits?: number;
}

export interface QantasApiMismatchParams {
  segment?: Segment;
  ourPoints?: number;
  ourStatusCredits?: number;
  qantasPoints?: number | null;
  qantasStatusCredits?: number | null;
  qantasError?: string | null;
  eliteStatus?: string;
  tripType?: string;
}

/**
 * Safely dispatches a custom event to PostHog, ignoring any errors or rejections.
 */
function safeTrack(
  eventName: string,
  properties: Record<string, string | number | boolean | null | undefined>
): void {
  try {
    if (process.env.NODE_ENV === "development") {
      return;
    }
    if (typeof posthog?.capture === "function") {
      posthog.capture(eventName, properties);
    }
  } catch {
    // Suppress errors so telemetry never affects user application flow
  }
}

/**
 * Tracks a completed calculation event.
 */
export function trackCalculationCompleted({
  segmentResults = [],
  tripType = "",
  eliteStatus = "",
  compareWithQantas = false,
  containsErrors = false,
  totalPoints = 0,
  totalStatusCredits = 0,
}: CalculationCompletedParams = {}): void {
  const routes: string[] = [];
  const airportSet = new Set<string>();
  const airlineSet = new Set<string>();

  segmentResults.forEach((result) => {
    const segment = result?.segment;
    if (!segment) return;

    const fromIata = segment.fromAirport?.iata ? segment.fromAirport.iata.toUpperCase() : "";
    const toIata = segment.toAirport?.iata ? segment.toAirport.iata.toUpperCase() : "";
    const airline = segment.airline ? segment.airline.toUpperCase() : "";

    if (fromIata && toIata) {
      routes.push(`${fromIata}-${toIata}`);
    }
    if (fromIata) airportSet.add(fromIata);
    if (toIata) airportSet.add(toIata);
    if (airline) airlineSet.add(airline);
  });

  safeTrack("calculation_completed", {
    route: routes.join(", ").slice(0, 255),
    airports: Array.from(airportSet).join(", ").slice(0, 255),
    airlines: Array.from(airlineSet).join(", ").slice(0, 255),
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
 */
export function trackQantasApiMismatch({
  segment,
  ourPoints = 0,
  ourStatusCredits = 0,
  qantasPoints = null,
  qantasStatusCredits = null,
  qantasError = null,
  eliteStatus = "",
  tripType = "",
}: QantasApiMismatchParams = {}): void {
  const fromIata = segment?.fromAirport?.iata ? segment.fromAirport.iata.toUpperCase() : "";
  const toIata = segment?.toAirport?.iata ? segment.toAirport.iata.toUpperCase() : "";
  const airline = segment?.airline ? segment.airline.toUpperCase() : "";
  const fareClass = segment?.fareClass ? segment.fareClass.toUpperCase() : "";

  const route = fromIata && toIata ? `${fromIata}-${toIata}` : "";

  safeTrack("qantas_api_mismatch", {
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
