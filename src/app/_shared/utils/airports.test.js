import { searchAirports } from '@/app/_shared/utils/airports';

describe('searchAirports', () => {
  test('returns empty array for an empty query', () => {
    expect(searchAirports('')).toEqual([]);
  });

  test('returns empty array for a whitespace-only query', () => {
    expect(searchAirports('   ')).toEqual([]);
  });

  test('returns empty array when nothing matches', () => {
    expect(searchAirports('zzzzzzz')).toEqual([]);
  });

  test('ranks an exact IATA code match first, ahead of city-name matches for other airports', () => {
    const results = searchAirports('syd', 3);
    expect(results[0].iata).toBe('SYD');
    expect(results[0].city).toBe('Sydney');
  });

  test('matches are case-insensitive', () => {
    const results = searchAirports('SYD', 3);
    expect(results[0].iata).toBe('SYD');
  });

  test('ranks a city-prefix match ahead of a name-substring-only match', () => {
    const results = searchAirports('lon', 100);
    const lhrIndex = results.findIndex((airport) => airport.iata === 'LHR');
    const yazIndex = results.findIndex((airport) => airport.iata === 'YAZ');
    expect(lhrIndex).toBeGreaterThanOrEqual(0);
    expect(yazIndex).toBeGreaterThanOrEqual(0);
    expect(lhrIndex).toBeLessThan(yazIndex);
  });

  test('returns multiple airports for a city with more than one airport', () => {
    const results = searchAirports('new york', 10);
    const iatas = results.map((airport) => airport.iata);
    expect(iatas).toEqual(expect.arrayContaining(['JFK', 'LGA']));
  });

  test('enforces an explicit limit', () => {
    const results = searchAirports('a', 5);
    expect(results.length).toBe(5);
  });

  test('defaults to a limit of 25 when none is given', () => {
    const results = searchAirports('a');
    expect(results.length).toBe(25);
  });
});
