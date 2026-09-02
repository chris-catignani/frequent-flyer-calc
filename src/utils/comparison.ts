export const POINTS_TOLERANCE_PER_SEGMENT = 1;

export function isAirlinePointsMatch(
  ourPoints: number,
  qantasPoints: number,
  tolerance: number = POINTS_TOLERANCE_PER_SEGMENT
): boolean {
  return Math.abs(ourPoints - qantasPoints) <= tolerance;
}

export function isElitePointsMatch(ourCredits: number, qantasCredits: number): boolean {
  return ourCredits === qantasCredits;
}

export function isClosePointsMatch(
  ourPoints: number,
  qantasPoints: number,
  tolerance: number = POINTS_TOLERANCE_PER_SEGMENT
): boolean {
  return ourPoints !== qantasPoints && Math.abs(ourPoints - qantasPoints) <= tolerance;
}
