import { PARTNER_AIRLINE_CODES } from "@/calculators/atmos/constants";

export type AtmosCabin = "discountEconomy" | "economy" | "premiumEconomy" | "business" | "first";

export interface PartnerFareClass {
  id: string;
  label: string;
  cabin: AtmosCabin;
}

export const CABIN_DISPLAY: Record<AtmosCabin, string> = {
  discountEconomy: "Discount Economy",
  economy: "Economy",
  premiumEconomy: "Premium Economy",
  business: "Business",
  first: "First",
};

const CABIN_BY_LABEL: Record<string, AtmosCabin> = {
  "Disc Econ": "discountEconomy",
  Econ: "economy",
  "Premium Econ": "premiumEconomy",
  Business: "business",
  First: "first",
};

// Copied verbatim from Atmos Rewards' partner fare class table (Partner Airline / Cabin /
// Purchased fare class). Keep quirks such as "N ,K" — fix the parser, not the data.
const PARTNER_CABIN_TABLE = `
Aer Lingus	Disc Econ	A, F, G, N, O, Q, Z
Aer Lingus	Econ	K, L, M, S, V
Aer Lingus	Business	B, C, D, H, I, J, R, Y
Air Tahiti Nui	Disc Econ	B, G, L, N, Q, S, T, V
Air Tahiti Nui	Econ	H, K, M, Y
Air Tahiti Nui	Premium Econ	A, E, P, W
Air Tahiti Nui	Business	C, D, J, Z
American Airlines	Disc Econ	O, Q, N, S
American Airlines	Econ	G, V, H, K, L, M, Y
American Airlines	Premium Econ	P, W
American Airlines	Business	J, D, I, R, C
American Airlines	First	F, A, X
British Airways	Disc Econ	Q, O, G, K, L, M, N, V, S
British Airways	Econ	Y, B, H
British Airways	Premium Econ	E, T, W
British Airways	Business	J, C, D, I, R
British Airways	First	F, A
Cathay Pacific	Disc Econ	B, H, K, L, M, V
Cathay Pacific	Econ	Y
Cathay Pacific	Premium Econ	E, R, W
Cathay Pacific	Business	J, C, D, I, P
Cathay Pacific	First	F, A
Condor	Disc Econ	X, W
Condor	Econ	L
Condor	Premium Econ	A
Condor	Business	I
Fiji Airways	Disc Econ	N, T, R
Fiji Airways	Econ	Y, B, H, L, O, K, W, Q, S, M, V
Fiji Airways	Business	J, D, C, Z, I
Finnair	Disc Econ	K, M, L, V, S, N, Q, O, Z, A, G
Finnair	Econ	Y, B, H
Finnair	Premium Econ	W, E, T, P
Finnair	Business	J, C, D, I, R
Hainan	Disc Econ	V, N, P, L, M, X, E
Hainan	Econ	B, H, K, Q, Y
Hainan	Premium Econ	W
Hainan	Business	C, D, I, Z, R
Iberia	Disc Econ	K, L, M, N, S, V, F, Z, G, Q, O, A
Iberia	Econ	Y, B, H
Iberia	Premium Econ	W, E, T
Iberia	Business	J, C, D, R, I
Icelandair	Disc Econ	Standard Economy Fare Type
Icelandair	Econ	Standard Flex Fare Type
Icelandair	Premium Econ	Saga Premium Fare Type
Icelandair	Business	Saga Premium Flex Fare Type
Japan Airlines	Disc Econ	N, Q, L, V, S, O, G, H, K, M
Japan Airlines	Econ	Y, B
Japan Airlines	Premium Econ	W, E, R
Japan Airlines	Business	J, C, D, I, X
Japan Airlines	First	F, A
Japan Transocean Air	Disc Econ	N, Q, L, V, S, O, G, H, K, M
Japan Transocean Air	Econ	Y, B
Korean Air	Disc Econ	L, U, Q, N, T, K
Korean Air	Econ	Y, B, M, W, S, H, E
Korean Air	Premium Econ	Z
Korean Air	Business	C, D, I, R, J
Korean Air	First	F, P
Malaysia Airlines	Disc Econ	K, L, M, N, S, V
Malaysia Airlines	Econ	H, B, Y
Malaysia Airlines	Business	J, C, D, F, A, Z
Oman Air	Econ	Y, B, K, H, M, L, V, S, N, Q, O, R, T, E
Oman Air	Business	J, C, D, I, P
Oman Air	First	F, A
Philippine Airlines	Disc Econ	E, K, T
Philippine Airlines	Econ	X, B, V, Q, H, M, L, S, Y
Philippine Airlines	Premium Econ	N, W
Philippine Airlines	Business	Z, I, D, C, J
Porter Airlines	Econ	L, X, A, S, P, N ,K, H, G, B, Y
Porter Airlines	Premium Econ	U, F, Q, E
Qantas	Disc Econ	G, K, L, M, N, O, Q, S, V
Qantas	Econ	H, B, Y
Qantas	Premium Econ	R, T, W
Qantas	Business	J, C, D, I
Qantas	First	F, A
Qatar Airways	Disc Econ	B, G, H, K, L, M, N, O, Q, S, T, V, W
Qatar Airways	Econ	Y
Qatar Airways	Business	J, C, D, I, R, P
Qatar Airways	First	F, A
Royal Air Maroc	Disc Econ	G, K, L, M, N, O, P, Q, R, S, T, V, W
Royal Air Maroc	Econ	H, B, Y
Royal Air Maroc	Business	J, C, D, I
Royal Jordanian	Disc Econ	B, H, K, L, M, O, Q, S, V, W
Royal Jordanian	Econ	Y
Royal Jordanian	Business	J, C, D, I, Z
STARLUX Airlines	Econ	Y, B, H, K, M, L, V, S, N
STARLUX Airlines	Premium Econ	W, R, E
STARLUX Airlines	Business	J, C, D
STARLUX Airlines	First	F, A
SriLankan Airlines	Disc Econ	E, H, K, L, M, N, O, Q, R, S, V, W
SriLankan Airlines	Econ	B, P, Y
SriLankan Airlines	Business	J, C, D, I
`;

export const parsePartnerCabinTable = (
  table: string,
  airlineCodes: Record<string, string>
): Record<string, PartnerFareClass[]> => {
  const result: Record<string, PartnerFareClass[]> = {};

  for (const rawLine of table.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const [airlineName, cabinLabel, fareClasses] = line
      .split(/\t+| {2,}/)
      .map((cell) => cell.trim());
    const iata = airlineCodes[airlineName];
    const cabin = CABIN_BY_LABEL[cabinLabel];
    if (!iata || !cabin || !fareClasses) {
      throw new Error(`Unrecognised partner cabin row: "${line}"`);
    }

    const entries = result[iata] ?? (result[iata] = []);
    for (const rawFareClass of fareClasses.split(",")) {
      // Icelandair lists fare types ("Standard Economy Fare Type") instead of letters
      const label = rawFareClass.trim().replace(/ Fare Type$/, "");
      if (!label) {
        continue;
      }
      const id = label.toLowerCase().replace(/\s+/g, "");
      if (entries.some((entry) => entry.id === id)) {
        throw new Error(`Duplicate fare class "${label}" for ${airlineName}`);
      }
      entries.push({ id, label, cabin });
    }
  }

  return result;
};

const PARTNER_FARE_CLASSES = parsePartnerCabinTable(PARTNER_CABIN_TABLE, PARTNER_AIRLINE_CODES);

export const getPartnerFareClasses = (airline: string): PartnerFareClass[] =>
  PARTNER_FARE_CLASSES[airline] ?? [];

export const getPartnerCabin = (
  airline: string,
  fareClass: string
): PartnerFareClass | undefined => {
  const id = fareClass.trim().toLowerCase();
  return id ? getPartnerFareClasses(airline).find((entry) => entry.id === id) : undefined;
};
