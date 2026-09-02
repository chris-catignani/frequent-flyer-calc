import { calculate, supportedAirlines } from "@/calculators/qantas/calculator";
import { qantasSegmentInputAdapter } from "@/components/qantas/fareClassInput";
import {
  PARTNER_NON_ONEWORLD_AIRLINES,
  PARTNER_ONEWORLD_AIRLINES,
  QANTAS_GRP_AIRLINES,
} from "@/calculators/qantas/constants";
import { buildAirlineOptions } from "@/constants/airlines";
import type { AirlineOption } from "@/types/segmentInput";
import type { EliteTier, FrequentFlyerProgram, ProgramCurrencies } from "@/types/program";

export const qantasCurrencies: ProgramCurrencies = {
  airlinePoints: {
    name: "Qantas Points",
    shortName: "Points",
  },
  elitePoints: {
    name: "Status Credits",
    shortName: "Status Credits",
  },
};

export const qantasEliteTiers: EliteTier[] = [
  { id: "bronze", name: "Bronze" },
  { id: "silver", name: "Silver", bonusMultiple: 0.5 },
  { id: "gold", name: "Gold", bonusMultiple: 0.75 },
  { id: "platinum", name: "Platinum", bonusMultiple: 1.0 },
  { id: "platinum_one", name: "Platinum One", bonusMultiple: 1.0 },
];

export const qantasAirlineOptions: AirlineOption[] = [
  ...buildAirlineOptions(Object.keys(QANTAS_GRP_AIRLINES), "Qantas Group Airlines"),
  ...buildAirlineOptions(PARTNER_ONEWORLD_AIRLINES, "oneworld Partner Airlines"),
  ...buildAirlineOptions(PARTNER_NON_ONEWORLD_AIRLINES, "Other Partner Airlines"),
];

export const qantasProgram: FrequentFlyerProgram = {
  id: "qantas",
  name: "Qantas Frequent Flyer",
  currencies: qantasCurrencies,
  eliteTiers: qantasEliteTiers,
  defaultEliteStatus: "Bronze",
  defaultAirline: "qf",
  defaultFareClass: "RedeDeal",
  supportedAirlines,
  airlineOptions: qantasAirlineOptions,
  segmentInputAdapter: qantasSegmentInputAdapter,
  calculate,
};

export { calculate };
