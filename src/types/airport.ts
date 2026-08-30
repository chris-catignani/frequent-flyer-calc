export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  state?: string;
  elevation?: number;
  icao?: string;
  [key: string]: unknown;
}
