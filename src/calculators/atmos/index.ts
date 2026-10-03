import { calculate } from "@/calculators/atmos/calculator";
import {
  ALASKA_GROUP_AIRLINES,
  ATMOS_ELITE_TIERS,
  ATMOS_SUPPORTED_AIRLINES,
  PARTNER_AIRLINE_CODES,
} from "@/calculators/atmos/constants";
import { DEFAULT_ATMOS_OPTIONS, validateAtmosOptions } from "@/calculators/atmos/options";
import { atmosSegmentInputAdapter } from "@/components/atmos/fareClassInput";
import { buildAirlineOptions, ONEWORLD_AIRLINES } from "@/constants/airlines";
import type { AirlineOption } from "@/types/segmentInput";
import type { FrequentFlyerProgram, ProgramCurrencies } from "@/types/program";

export const atmosCurrencies: ProgramCurrencies = {
  airlinePoints: { name: "Atmos Points", shortName: "Points" },
  elitePoints: { name: "Status Points", shortName: "Status Points" },
};

const partnerCodes = Object.values(PARTNER_AIRLINE_CODES).sort();

export const atmosAirlineOptions: AirlineOption[] = [
  ...buildAirlineOptions([...ALASKA_GROUP_AIRLINES], "Alaska Airlines Group"),
  ...buildAirlineOptions(
    partnerCodes.filter((iata) => iata in ONEWORLD_AIRLINES),
    "oneworld Partner Airlines"
  ),
  ...buildAirlineOptions(
    partnerCodes.filter((iata) => !(iata in ONEWORLD_AIRLINES)),
    "Other Partner Airlines"
  ),
];

export const atmosProgram: FrequentFlyerProgram = {
  id: "atmos",
  name: "Atmos Rewards",
  currencies: atmosCurrencies,
  eliteTiers: ATMOS_ELITE_TIERS,
  defaultEliteStatus: "Member",
  defaultAirline: "as",
  supportedAirlines: ATMOS_SUPPORTED_AIRLINES,
  airlineOptions: atmosAirlineOptions,
  segmentInputAdapter: atmosSegmentInputAdapter,
  defaultOptions: DEFAULT_ATMOS_OPTIONS,
  validateOptions: validateAtmosOptions,
  calculate,
};

export { calculate };
