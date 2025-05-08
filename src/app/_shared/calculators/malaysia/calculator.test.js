import { buildSegment, buildSegmentFromString } from '../../test/testUtils';
import { calculate } from './calculator';

describe('calculate - go path', () => {
  test('basic 1 segment test', () => {
    const segment = buildSegment('aa', 'i', 'jfk', 'lhr');
    const result = calculate([segment], 'Blue');
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment,
          ruleName: 'American Airlines',
          ruleUrl:
            'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/american-airlines.html',
          airlinePoints: 4302,
          elitePoints: 6,
          airlinePointsBreakdown: {
            basePoints: 4302,
            eliteBonus: {},
            totalEarned: 4302,
          },
        },
      ],
      containsErrors: false,
      elitePoints: 6,
      airlinePoints: 4302,
    });
  });

  test('2 segment test', () => {
    const segment1 = buildSegment('aa', 'i', 'jfk', 'lax');
    const segment2 = buildSegment('aa', 'i', 'lax', 'syd');
    const result = calculate([segment1, segment2], 'Blue');
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment: segment1,
          ruleName: 'American Airlines',
          ruleUrl:
            'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/american-airlines.html',
          airlinePoints: 3086,
          elitePoints: 6,
          airlinePointsBreakdown: {
            basePoints: 3086,
            eliteBonus: {},
            totalEarned: 3086,
          },
        },
        {
          segment: segment2,
          ruleName: 'American Airlines',
          ruleUrl:
            'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/american-airlines.html',
          airlinePoints: 9367,
          elitePoints: 10,
          airlinePointsBreakdown: {
            basePoints: 9367,
            eliteBonus: {},
            totalEarned: 9367,
          },
        },
      ],
      containsErrors: false,
      elitePoints: 16,
      airlinePoints: 12453,
    });
  });
});

describe('calculate - partners', () => {
  test.each([
    ['aa i syd sfo', 9281, 10],
    ['ba i jfk lhr', 3442, 6],
    ['ay i lhr hel', 1148, 3],
  ])(
    `Testing routing %s. Should earn %s points and %s elite points`,
    (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = calculate([buildSegmentFromString(segmentString)], 'Blue');
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('Test for non earning airline fare classes', () => {
  test.each([['aa q jfk ord', 0, 0]])(
    `%s should earn %s airline points and %s status credit`,
    (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = calculate([buildSegmentFromString(segmentString)], 'Blue');
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('Test for each earning zone', () => {
  test.each([
    { segmentString: 'aa y jfk bos', elitePoints: 1, description: 'zone 1 economy' },
    { segmentString: 'aa i jfk bos', elitePoints: 2, description: 'zone 1 business' },
    { segmentString: 'aa a jfk bos', elitePoints: 3, description: 'zone 1 first' },

    { segmentString: 'aa y jfk ord', elitePoints: 2, description: 'zone 2 economy' },
    { segmentString: 'aa i jfk ord', elitePoints: 3, description: 'zone 2 business' },
    { segmentString: 'aa a jfk ord', elitePoints: 4, description: 'zone 2 first' },

    { segmentString: 'aa y jfk den', elitePoints: 3, description: 'zone 3 economy' },
    { segmentString: 'aa i jfk den', elitePoints: 5, description: 'zone 3 business' },
    { segmentString: 'aa a jfk den', elitePoints: 6, description: 'zone 3 first' },

    { segmentString: 'aa y jfk sfo', elitePoints: 4, description: 'zone 4 economy' },
    { segmentString: 'aa i jfk sfo', elitePoints: 6, description: 'zone 4 business' },
    { segmentString: 'aa a jfk sfo', elitePoints: 8, description: 'zone 4 first' },

    { segmentString: 'aa y jfk hnl', elitePoints: 6, description: 'zone 5 economy' },
    { segmentString: 'aa i jfk hnl', elitePoints: 8, description: 'zone 5 business' },
    { segmentString: 'aa a jfk hnl', elitePoints: 10, description: 'zone 5 first' },

    { segmentString: 'aa y jfk nrt', elitePoints: 8, description: 'zone 6 economy' },
    { segmentString: 'aa i jfk nrt', elitePoints: 10, description: 'zone 6 business' },
    { segmentString: 'aa a jfk nrt', elitePoints: 12, description: 'zone 6 first' },

    { segmentString: 'aa y jfk syd', elitePoints: 8, description: 'zone 7 economy' },
    { segmentString: 'aa i jfk syd', elitePoints: 10, description: 'zone 7 business' },
    { segmentString: 'aa a jfk syd', elitePoints: 12, description: 'zone 7 first' },
  ])('Testing routing $description should earn $elitePoints', ({ segmentString, elitePoints }) => {
    const results = calculate([buildSegmentFromString(segmentString)], 'Blue');
    expect(results.containsErrors).toBe(false);
    expect(results.elitePoints).toBe(elitePoints);
  });
});
