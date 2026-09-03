export interface Earnings {
  readonly airlinePoints: number;
  readonly elitePoints: number;
}

export const createEarnings = (airlinePoints: number, elitePoints: number): Earnings => ({
  airlinePoints,
  elitePoints,
});
