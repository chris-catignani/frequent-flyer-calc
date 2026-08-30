import { airports } from '@nwpr/airport-codes';
import GreatCircle from 'great-circle';
import type { Airport } from '@/types/airport';

const airportFixes: { city: Record<string, string> } = {
  city: {
    'Dallas-Fort Worth': 'Dallas',
  },
};

interface SearchIndexEntry {
  airport: Airport;
  iataLower: string;
  cityLower: string;
  nameLower: string;
}

let _searchIndex: SearchIndexEntry[] | null = null;

const standardizeAirport = (airport?: Airport | null): Airport | null => {
  if (airport && airport.city in airportFixes.city) {
    airport.city = airportFixes.city[airport.city];
  }
  return airport || null;
};

export const getAirport = (iata: string): Airport | null => {
  const airport = (airports as unknown as Airport[]).find(
    (airport) => airport.iata === iata.toUpperCase(),
  );
  return standardizeAirport(airport);
};

export const getAirportsForCity = (city: string): Airport[] => {
  return (airports as unknown as Airport[])
    .filter((airport) => {
      return (
        airport.city.toLowerCase() === city.toLowerCase() && airport.iata // some airports don't have IATA codes, skip them
      );
    })
    .map((airport) => standardizeAirport(airport) as Airport);
};

export const getAirportsForCountry = (country: string): Airport[] => {
  return (airports as unknown as Airport[])
    .filter((airport) => {
      return (
        airport.country.toLowerCase() === country.toLowerCase() && airport.iata // some airports don't have IATA codes, skip them
      );
    })
    .map((airport) => standardizeAirport(airport) as Airport);
};

export const calcDistance = (airport1: Airport, airport2: Airport): number => {
  return Math.floor(
    GreatCircle.distance(
      airport1.latitude,
      airport1.longitude,
      airport2.latitude,
      airport2.longitude,
      'MI',
    ),
  );
};

const buildSearchIndex = (): SearchIndexEntry[] => {
  return (airports as unknown as Airport[])
    .filter((airport) => airport.iata)
    .map((airport) => {
      standardizeAirport(airport);
      return {
        airport,
        iataLower: airport.iata.toLowerCase(),
        cityLower: airport.city.toLowerCase(),
        nameLower: airport.name.toLowerCase(),
      };
    });
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
