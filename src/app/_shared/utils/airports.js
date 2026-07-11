import { airports } from '@nwpr/airport-codes';
import GreatCircle from 'great-circle';

const airportFixes = {
  city: {
    'Dallas-Fort Worth': 'Dallas',
  },
};

let _searchIndex = null;

const standardizeAirport = (airport) => {
  if (airport && airport.city in airportFixes.city) {
    airport.city = airportFixes.city[airport.city];
  }
  return airport;
};

export const getAirport = (iata) => {
  const airport = airports.find((airport) => airport.iata === iata.toUpperCase());
  return standardizeAirport(airport);
};

export const getAirportsForCity = (city) => {
  return airports
    .filter((airport) => {
      return (
        airport.city.toLowerCase() === city.toLowerCase() && airport.iata // some airports don't have IATA codes, skip them
      );
    })
    .map((airport) => standardizeAirport(airport));
};

export const getAirportsForCountry = (country) => {
  return airports
    .filter((airport) => {
      return (
        airport.country.toLowerCase() === country.toLowerCase() && airport.iata // some airports don't have IATA codes, skip them
      );
    })
    .map((airport) => standardizeAirport(airport));
};

export const calcDistance = (airport1, airport2) => {
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

const buildSearchIndex = () => {
  return airports
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

const scoreEntry = (entry, query) => {
  if (entry.iataLower === query) return SCORE_EXACT_IATA;
  if (entry.iataLower.startsWith(query)) return SCORE_IATA_PREFIX;
  if (entry.cityLower.startsWith(query)) return SCORE_CITY_PREFIX;
  if (entry.nameLower.startsWith(query)) return SCORE_NAME_PREFIX;
  if (entry.iataLower.includes(query)) return SCORE_IATA_SUBSTRING;
  if (entry.cityLower.includes(query)) return SCORE_CITY_SUBSTRING;
  if (entry.nameLower.includes(query)) return SCORE_NAME_SUBSTRING;
  return null;
};

export const searchAirports = (query, limit = 25) => {
  const normalizedQuery = query?.toLowerCase().trim();
  if (!normalizedQuery) {
    return [];
  }

  if (!_searchIndex) {
    _searchIndex = buildSearchIndex();
  }

  const matches = [];
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
