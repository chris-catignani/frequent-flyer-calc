import { QantasEarnings } from '@/models/qantasEarnings';
import { IntraCountryRule, DistanceRule, GeographicalRule } from './rules';
import { buildSegmentFromString } from '@/test/testUtils';

describe('rules', () => {
  describe('IntraCountryRule', () => {
    const distanceBands = [
      {
        minDistance: 0,
        maxDistance: 100,
        earnings: { business: new QantasEarnings(100, 10) },
      },
      {
        minDistance: 100,
        maxDistance: 200,
        earnings: { business: new QantasEarnings(200, 20) },
      },
    ];
    // eslint-disable-next-line
    const intraCountryRule = new IntraCountryRule(
      'distance rule',
      'https://google.com',
      'United States',
      distanceBands,
    );
    //TODO mock airports to specify distances?
    expect(true).toBe(true);
  });

  describe('DistanceRule', () => {
    const distanceBands = [
      {
        minDistance: 0,
        maxDistance: 100,
        earnings: { business: new QantasEarnings(100, 10) },
      },
      {
        minDistance: 100,
        maxDistance: 200,
        earnings: { business: new QantasEarnings(200, 20) },
      },
    ];
    // eslint-disable-next-line
    const distanceRule = new DistanceRule('distance rule', 'https://google.com', distanceBands);
    //TODO mock airports to specify distances?
    expect(true).toBe(true);

    test('Handles no max distance specified', () => {
      const distanceBands = [
        {
          minDistance: 0,
          maxDistance: 100,
          earnings: { business: new QantasEarnings(100, 10) },
        },
        {
          minDistance: 100,
          earnings: { business: new QantasEarnings(200, 20) },
        },
      ];
      const distanceRule = new DistanceRule('distance rule', 'https://google.com', distanceBands);
      expect(distanceRule.applies(buildSegmentFromString('aa i jfk lax'), 'business')).toBe(true);
      expect(
        distanceRule.calculate(buildSegmentFromString('aa i jfk lax'), 'business'),
      ).toMatchObject({
        qantasPoints: 200,
        statusCredits: 20,
      });
    });
  });

  describe('GeographicalRule', () => {
    describe('City to City', () => {
      const geographicalRule = new GeographicalRule('geographical rule', 'https://google.com', {
        origin: { city: new Set(['dallas', 'houston']) },
        destination: {
          city: {
            'san francisco': { business: new QantasEarnings(100, 10) },
            boston: { business: new QantasEarnings(200, 20) },
          },
        },
      });

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(buildSegmentFromString('aa i dfw sfo'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i sfo dfw'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i dfw bos'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i bos dfw'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i iah bos'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i bos iah'), 'business')).toBe(
          true,
        );
      });

      test.each([
        ['aa i dfw sfo', 100, 10],
        ['aa i sfo dfw', 100, 10],
        ['aa i dfw bos', 200, 20],
        ['aa i bos dfw', 200, 20],
      ])(
        `Go path - calculate - %s should yield %s and %s`,
        (segmentString, expectedQantasPoints, expectedStatusCredits) => {
          expect(
            geographicalRule.calculate(buildSegmentFromString(segmentString), 'business'),
          ).toMatchObject({
            qantasPoints: expectedQantasPoints,
            statusCredits: expectedStatusCredits,
          });
        },
      );

      test('Rule does not apply', () => {
        // use same airports but invalid combination
        expect(geographicalRule.applies(buildSegmentFromString('aa i dfw iah'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i sfo bos'), 'business')).toBe(
          false,
        );

        // use 1 valid and 1 not valid airports
        expect(geographicalRule.applies(buildSegmentFromString('aa i dfw lax'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lax dfw'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i sfo lax'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lax sfo'), 'business')).toBe(
          false,
        );

        // use 2 invalid airports
        expect(geographicalRule.applies(buildSegmentFromString('aa i lax lga'), 'business')).toBe(
          false,
        );
      });
    });

    describe('Country to Country', () => {
      const geographicalRule = new GeographicalRule('geographical rule', 'https://google.com', {
        origin: { country: new Set(['united states', 'canada']) },
        destination: {
          country: {
            'united kingdom': { business: new QantasEarnings(300, 30) },
            france: { business: new QantasEarnings(400, 40) },
          },
        },
      });

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk lhr'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lhr jfk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk cdg'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i cdg jfk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i yyz cdg'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i cdg yyz'), 'business')).toBe(
          true,
        );
      });

      test.each([
        ['aa i jfk lhr', 300, 30],
        ['aa i lhr jfk', 300, 30],
        ['aa i yyz cdg', 400, 40],
        ['aa i cdg yyz', 400, 40],
      ])(
        `Go path - calculate - %s should yield %s and %s`,
        (segmentString, expectedQantasPoints, expectedStatusCredits) => {
          expect(
            geographicalRule.calculate(buildSegmentFromString(segmentString), 'business'),
          ).toMatchObject({
            qantasPoints: expectedQantasPoints,
            statusCredits: expectedStatusCredits,
          });
        },
      );

      test('Rule does not apply', () => {
        // use same regions but invalid combination
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk lax'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i yyz yvr'), 'business')).toBe(
          false,
        );

        // use 1 valid and 1 not valid region
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk ams'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i ams jfk'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i yyz mad'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i mad yyz'), 'business')).toBe(
          false,
        );

        // use 2 invalid airports
        expect(geographicalRule.applies(buildSegmentFromString('aa i mex mad'), 'business')).toBe(
          false,
        );
      });
    });

    describe('Region to Region', () => {
      const geographicalRule = new GeographicalRule('geographical rule', 'https://google.com', {
        origin: { region: new Set(['usaEastCoast', 'northernEurope']) },
        destination: {
          region: {
            westernEurope: { business: new QantasEarnings(500, 50) },
            southeastAsia: { business: new QantasEarnings(600, 60) },
          },
        },
      });

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk lhr'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lhr jfk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk bkk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i bkk jfk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i hel bkk'), 'business')).toBe(
          true,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i bkk hel'), 'business')).toBe(
          true,
        );
      });

      test.each([
        ['aa i jfk lhr', 500, 50],
        ['aa i lhr jfk', 500, 50],
        ['aa i hel bkk', 600, 60],
        ['aa i bkk hel', 600, 60],
      ])(
        `Go path - calculate - %s should yield %s and %s`,
        (segmentString, expectedQantasPoints, expectedStatusCredits) => {
          expect(
            geographicalRule.calculate(buildSegmentFromString(segmentString), 'business'),
          ).toMatchObject({
            qantasPoints: expectedQantasPoints,
            statusCredits: expectedStatusCredits,
          });
        },
      );

      test('Rule does not apply', () => {
        // use same regions but invalid combination
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk hel'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i hel jfk'), 'business')).toBe(
          false,
        );

        // use 1 valid and 1 not valid region
        expect(geographicalRule.applies(buildSegmentFromString('aa i jfk lax'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lax jfk'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i hel lax'), 'business')).toBe(
          false,
        );
        expect(geographicalRule.applies(buildSegmentFromString('aa i lax hnd'), 'business')).toBe(
          false,
        );

        // use 2 invalid airports
        expect(geographicalRule.applies(buildSegmentFromString('aa i mex eze'), 'business')).toBe(
          false,
        );
      });
    });
  });

  // TODO test mixes of cities,  regions, countries

  // TODO test error states: (1) no fare earning category for a given bucket (2)
});
