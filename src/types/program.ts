import type { Segment } from "@/app/_shared/models/segment";
import type { AirlineOption, SegmentInputAdapter } from "@/app/_shared/components/segmentInput";
import type { CalculationResult } from "@/types/calculator";

export interface CurrencyDefinition {
  name: string; // e.g. "Qantas Points", "Velocity Points", "Avios"
  shortName: string; // e.g. "Points", "Avios"
  symbol?: string;
}

export interface ProgramCurrencies {
  airlinePoints: CurrencyDefinition;
  elitePoints: CurrencyDefinition;
}

export interface EliteTier {
  id: string; // e.g. "bronze", "silver", "gold", "platinum", "platinum_one"
  name: string; // e.g. "Bronze", "Silver", "Gold", "Platinum", "Platinum One"
  bonusMultiple?: number; // e.g. 0.5 for Silver
}

export interface CalculationOptions {
  compareWithProgramApi?: boolean;
  [key: string]: unknown;
}

export interface FrequentFlyerProgram {
  /** Unique program identifier (e.g. "qantas", "velocity", "ba") */
  id: string;
  /** Display name of the program (e.g. "Qantas Frequent Flyer") */
  name: string;
  /** Reward and status currency configurations */
  currencies: ProgramCurrencies;
  /** List of elite tiers recognized by the program */
  eliteTiers: EliteTier[];
  /** Default elite tier name to preselect in the UI (e.g. "Bronze") */
  defaultEliteStatus: string;
  /** Default airline IATA code for newly created segments (e.g. "qf") */
  defaultAirline: string;
  /** Optional default fare class code for newly created segments (e.g. "RedeDeal") */
  defaultFareClass?: string;
  /** Set of supported airline IATA codes for earn calculations */
  supportedAirlines: Set<string>;
  /** Grouped airline options for dropdown selection */
  airlineOptions: AirlineOption[];
  /** Optional UI adapter for custom fare class inputs and route clearing */
  segmentInputAdapter?: SegmentInputAdapter;
  /** Calculation engine executing earning rules */
  calculate: (
    segments: Segment[],
    eliteStatus?: string,
    priceLessTaxes?: number,
    options?: CalculationOptions | boolean
  ) => Promise<CalculationResult>;
}
