import type { Community } from "@/calculators/atmos/options";
import type { EliteTier } from "@/types/program";

export const CHOOSE_HOW_YOU_EARN_URL =
  "https://www.alaskaair.com/content/earn-points/choose-how-you-earn";
export const PARTNER_EARN_CHART_URL = "https://www.alaskaair.com/content/earn-points/flights/2027";

export const ALASKA_GROUP_AIRLINES = new Set(["as", "ha"]);

// Airline names exactly as they appear in Atmos Rewards' partner fare class table
export const PARTNER_AIRLINE_CODES: Record<string, string> = {
  "Aer Lingus": "ei",
  "Air Tahiti Nui": "tn",
  "American Airlines": "aa",
  "British Airways": "ba",
  "Cathay Pacific": "cx",
  Condor: "de",
  "Fiji Airways": "fj",
  Finnair: "ay",
  Hainan: "hu",
  Iberia: "ib",
  Icelandair: "fi",
  "Japan Airlines": "jl",
  "Japan Transocean Air": "nu",
  "Korean Air": "ke",
  "Malaysia Airlines": "mh",
  "Oman Air": "wy",
  "Philippine Airlines": "pr",
  "Porter Airlines": "pd",
  Qantas: "qf",
  "Qatar Airways": "qr",
  "Royal Air Maroc": "at",
  "Royal Jordanian": "rj",
  "STARLUX Airlines": "jx",
  "SriLankan Airlines": "ul",
};

export const ATMOS_SUPPORTED_AIRLINES = new Set([
  ...ALASKA_GROUP_AIRLINES,
  ...Object.values(PARTNER_AIRLINE_CODES),
]);

export const ATMOS_ELITE_TIERS: EliteTier[] = [
  { id: "member", name: "Member" },
  { id: "silver", name: "Silver", bonusMultiple: 0.25 },
  { id: "gold", name: "Gold", bonusMultiple: 0.5 },
  { id: "platinum", name: "Platinum", bonusMultiple: 1.0 },
  { id: "titanium", name: "Titanium", bonusMultiple: 1.5 },
];

// Country names as they appear in src/data/airports.json; US territories count as the US
export const US_COUNTRIES = new Set([
  "United States",
  "Guam",
  "Puerto Rico",
  "U.S. Virgin Islands",
  "Northern Mariana Islands",
  "American Samoa",
]);

export const COMMUNITY_DISPLAY: Record<Community, string> = {
  none: "None",
  globalLocals: "Global Locals",
  huakai: "Huakaʻi by Hawaiian",
  club49: "Club 49",
  culinaryJourneys: "Culinary Journeys",
  activeEscapes: "Active Escapes",
  familiesOnTheGo: "Families On the Go",
};

export type ChartCategory =
  | "internationalBusinessFirst"
  | "domesticBusinessFirst"
  | "premiumEconomy"
  | "economy"
  | "discountEconomy";

// "Other partner earn chart": fractions of distance flown. Status points = base + bonus.
export const PARTNER_CHART: Record<ChartCategory, { base: number; bonus: number }> = {
  internationalBusinessFirst: { base: 1.0, bonus: 1.5 },
  domesticBusinessFirst: { base: 1.0, bonus: 0.5 },
  premiumEconomy: { base: 1.0, bonus: 0 },
  economy: { base: 0.5, bonus: 0 },
  discountEconomy: { base: 0.25, bonus: 0 },
};

export const CHART_CATEGORY_DISPLAY: Record<ChartCategory, string> = {
  internationalBusinessFirst: "International Business/First",
  domesticBusinessFirst: "Domestic Business/First",
  premiumEconomy: "Premium Economy",
  economy: "Economy",
  discountEconomy: "Discount Economy",
};

export const POINTS_PER_DOLLAR = 5;
export const POINTS_PER_SEGMENT = 500;
export const REDEEMED_POINTS_PER_STATUS_POINT = 20;
// Community bonuses: https://www.alaskaair.com/atmosrewards/content/benefits/2026-updates/communities
export const GLOBAL_LOCALS_BONUS = 0.1;
export const HUAKAI_BONUS = 0.5;

// Huakaʻi by Hawaiian earns its bonus on flights between these airports
export const HAWAII_AIRPORTS = new Set([
  "HNL",
  "HNM",
  "ITO",
  "JHM",
  "KOA",
  "LIH",
  "LNY",
  "LUP",
  "MKK",
  "MUE",
  "OGG",
]);

// Partner flights booked on these airlines' own sites earn no status points
export const STATUS_POINTS_EXCLUDED_PARTNERS = new Set(["jx", "pr"]);
