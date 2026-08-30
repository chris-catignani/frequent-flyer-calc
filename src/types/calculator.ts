import type { Segment } from '@/app/_shared/models/segment';

export type FareEarnCategory =
  | 'discountEconomy'
  | 'economy'
  | 'flexibleEconomy'
  | 'premiumEconomy'
  | 'flexiblePremiumEconomy'
  | 'business'
  | 'flexibleBusiness'
  | 'first'
  | 'none'
  | string;

export interface EliteBonus {
  eligibleFareCategory?: string;
  airlinePoints?: number;
}

export interface AirlinePointsBreakdown {
  basePoints?: number;
  eliteBonus?: EliteBonus;
  minPoints?: number;
  totalEarned?: number;
}

export interface RuleCalculationReturn {
  rule?: string;
  ruleUrl?: string;
  fareEarnCategory?: string;
  notes?: string;
  airlinePoints: number;
  elitePoints: number;
}

export interface QantasApiQuoteData {
  airlinePoints?: number;
  elitePoints?: number;
  [key: string]: unknown;
}

export interface QantasApiResults {
  qantasData?: QantasApiQuoteData;
  error?: Error | { message?: string } | null;
  [key: string]: unknown;
}

export interface SegmentResult {
  segment: Segment;
  ruleName?: string;
  ruleUrl?: string;
  fareEarnCategory?: string;
  notes?: string;
  elitePoints?: number;
  airlinePoints?: number;
  airlinePointsBreakdown?: AirlinePointsBreakdown;
  qantasAPIResults?: QantasApiResults;
  error?: Error | unknown;
}

export interface CalculationResult {
  segmentResults: SegmentResult[];
  containsErrors: boolean;
  elitePoints: number;
  airlinePoints: number;
}
