import { airports } from '@nwpr/airport-codes';
import GreatCircle from 'great-circle';

const airportFixes = {
  city: {
    'Dallas-Fort Worth': 'Dallas',
  },
};

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
