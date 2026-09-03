import rawAirports from "@/data/airports.json";
import GreatCircle from "great-circle";
import type { Airport } from "@/types/airport";

interface SearchIndexEntry {
  airport: Airport;
  iataLower: string;
  cityLower: string;
  nameLower: string;
}

const airports: Airport[] = (rawAirports as Airport[]).map((a) => Object.freeze(a));

const iataMap = new Map<string, Airport>();
const cityMap = new Map<string, Airport[]>();
const countryMap = new Map<string, Airport[]>();

for (const airport of airports) {
  iataMap.set(airport.iata.toUpperCase(), airport);

  const cityLower = airport.city.trim().toLowerCase();
  if (cityLower) {
    let cityList = cityMap.get(cityLower);
    if (!cityList) {
      cityList = [];
      cityMap.set(cityLower, cityList);
    }
    cityList.push(airport);
  }

  const countryLower = airport.country.trim().toLowerCase();
  if (countryLower) {
    let countryList = countryMap.get(countryLower);
    if (!countryList) {
      countryList = [];
      countryMap.set(countryLower, countryList);
    }
    countryList.push(airport);
  }
}

export const getAirport = (iata: string): Airport | null => {
  const key = iata?.trim().toUpperCase();
  return key ? (iataMap.get(key) ?? null) : null;
};

export const getAirportsForCity = (city: string): Airport[] => {
  const key = city?.trim().toLowerCase();
  return key ? (cityMap.get(key) ?? []) : [];
};

export const getAirportsForCountry = (country: string): Airport[] => {
  const key = country?.trim().toLowerCase();
  return key ? (countryMap.get(key) ?? []) : [];
};

export const calcDistance = (airport1: Airport, airport2: Airport): number => {
  return Math.floor(
    GreatCircle.distance(
      airport1.latitude,
      airport1.longitude,
      airport2.latitude,
      airport2.longitude,
      "MI"
    )
  );
};

let _searchIndex: SearchIndexEntry[] | null = null;

const buildSearchIndex = (): SearchIndexEntry[] => {
  return airports.map((airport) => ({
    airport,
    iataLower: airport.iata.toLowerCase(),
    cityLower: airport.city.toLowerCase(),
    nameLower: airport.name.toLowerCase(),
  }));
};

const SCORE_EXACT_IATA = 0;
const SCORE_IATA_PREFIX = 1;
const SCORE_CITY_PREFIX = 2;
const SCORE_NAME_PREFIX = 3;
const SCORE_IATA_SUBSTRING = 4;
const SCORE_CITY_SUBSTRING = 5;
const SCORE_NAME_SUBSTRING = 6;

const scoreEntry = (entry: SearchIndexEntry, query: string): number | null => {
  if (entry.iataLower === query) return SCORE_EXACT_IATA;
  if (entry.iataLower.startsWith(query)) return SCORE_IATA_PREFIX;
  if (entry.cityLower.startsWith(query)) return SCORE_CITY_PREFIX;
  if (entry.nameLower.startsWith(query)) return SCORE_NAME_PREFIX;
  if (entry.iataLower.includes(query)) return SCORE_IATA_SUBSTRING;
  if (entry.cityLower.includes(query)) return SCORE_CITY_SUBSTRING;
  if (entry.nameLower.includes(query)) return SCORE_NAME_SUBSTRING;
  return null;
};

export const searchAirports = (query: string, limit: number = 25): Airport[] => {
  const normalizedQuery = query?.toLowerCase().trim();
  if (!normalizedQuery) {
    return [];
  }

  if (!_searchIndex) {
    _searchIndex = buildSearchIndex();
  }

  const matches: Array<{ entry: SearchIndexEntry; score: number }> = [];
  for (const entry of _searchIndex) {
    const score = scoreEntry(entry, normalizedQuery);
    if (score !== null) {
      matches.push({ entry, score });
    }
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.entry.cityLower.localeCompare(b.entry.cityLower);
  });

  return matches.slice(0, limit).map((match) => match.entry.airport);
};
