import { buildSegment, buildSegmentFromString } from '../../test/testUtils';
import { calculate } from './calculator';

describe('calculate - go path', () => {
  test('basic 1 segment test', async () => {
    const segment = buildSegment('aa', 'i', 'jfk', 'lax');
    const result = await calculate([segment], 'Bronze');
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment,
          fareEarnCategory: 'business',
          notes: 'East Coast USA/Canada to West Coast USA/Canada',
          ruleName: 'USA East Coast / Canada',
          ruleUrl:
            'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-east-coast-usa-canada-and-',
          airlinePoints: 3125,
          elitePoints: 100,
          airlinePointsBreakdown: {
            basePoints: 3125,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 3125,
          },
        },
      ],
      containsErrors: false,
      elitePoints: 100,
      airlinePoints: 3125,
    });
  });

  test('2 segment test', async () => {
    const segment1 = buildSegment('aa', 'i', 'jfk', 'lax');
    const segment2 = buildSegment('aa', 'i', 'lax', 'syd');
    const result = await calculate([segment1, segment2], 'Bronze');
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment: segment1,
          fareEarnCategory: 'business',
          notes: 'East Coast USA/Canada to West Coast USA/Canada',
          ruleName: 'USA East Coast / Canada',
          ruleUrl:
            'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-east-coast-usa-canada-and-',
          airlinePoints: 3125,
          elitePoints: 100,
          airlinePointsBreakdown: {
            basePoints: 3125,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 3125,
          },
        },
        {
          segment: segment2,
          fareEarnCategory: 'business',
          notes: 'sydney to West Coast USA/Canada',
          ruleName: 'Sydney, Melbourne, Brisbane, Gold Coast',
          ruleUrl:
            'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-syd-mel-bne-ool-and-',
          airlinePoints: 13500,
          elitePoints: 180,
          airlinePointsBreakdown: {
            basePoints: 13500,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 13500,
          },
        },
      ],
      containsErrors: false,
      elitePoints: 280,
      airlinePoints: 16625,
    });
  });
});

describe('calculate - partner rules', () => {
  test.each([
    ['aa i syd sfo', 13500, 180],
    ['aa i syd jfk', 18600, 280],
    ['aa i syd dfw', 14700, 200],
    ['cx i syd hkg', 5600, 60],
    ['jl i mel hnd', 6000, 60],
    ['qr i bne doh', 7400, 80],
    ['ba i mel lhr', 13125, 140],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Sydney, Melbourne, Brisbane, Gold Coast and`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['cx i per hkg', 4700, 120],
    ['qr i per doh', 5800, 120],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Perth and`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['cx i adl hkg', 5400, 100],
    ['qr i adl doh', 7000, 90],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Adelaide and`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['cx i cns hkg', 4250, 50]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Cairns and`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['cx i lhr hkg', 7400, 120],
    ['ba i lhr bkk', 7400, 120],
    ['ba i lhr kul', 8125, 120],
    ['jl i hnd cdg', 7400, 120],
    ['qr i mad doh', 3000, 60],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Western Europe`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['cx i hel hkg', 6125, 120],
    ['ba i hel bkk', 6125, 120],
    ['jl i hnd hel', 6125, 120],
    ['qr i hel doh', 3000, 60],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Northern Europe`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['qr i doh ist', 1800, 50]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Southern Europe`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['cx i hkg tlv', 6000, 60]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Tel Aviv`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qr i doh bkk', 4250, 100],
    ['qr i doh sin', 4250, 100],
    ['qr i doh kul', 4250, 100],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dubai Doha`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['aa i jfk bos', 400, 40],
    ['aa i jfk ord', 750, 40],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Intra USA Short Haul`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['aa i jfk lax', 3125, 100]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for East Coast USA/Canada`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['aa i akl lax', 12000, 160],
    ['aa i akl dfw', 12750, 170],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for New Zealand`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['aa i dfw sfo', 3125, 100],
    ['aa i dfw bos', 1875, 80],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dallas`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('calculate - qantas rules', () => {
  test.each([
    ['qf i syd mel', 1400, 40],
    ['qf i syd asp', 2100, 60],
    ['qf i syd per', 3300, 80],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for pre July 2025 Domestic Australia`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)], '', false, true);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf i syd mel', 1750, 40],
    ['qf i syd asp', 2625, 60],
    ['qf i syd per', 4125, 80],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for post July 2025 Domestic Australia`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate(
        [buildSegmentFromString(segmentString)],
        '',
        0.0,
        false,
        false,
      );
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d syd akl', 2700, 85],
    ['qf d syd bkk', 8450, 125],
    ['qf d syd hnd', 8450, 125],
    ['qf d mel hnl', 9750, 150],
    ['qf d adl dfw', 15950, 210],
    ['qf d bne lax', 14625, 190],
    ['qf d ool jfk', 20150, 295],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Adelaide, Brisbane, Gold Coast, Melbourne, Sydney`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d drw bkk', 4400, 100],
    ['qf d per hnd', 8125, 125],
    ['qf d drw dxb', 9750, 150],
    ['qf d per lhr', 15300, 255],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Darwin, Perth`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d akl dfw', 13835, 180],
    ['qf d akl scl', 9450, 150],
    ['qf d akl jfk', 17450, 210],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for New Zealand`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d dfw jfk', 4200, 85],
    ['qf d dfw lax', 5525, 105],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dallas`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['qf d jfk lax', 5525, 105]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for USA East Coast`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d dxb lhr', 5525, 105],
    ['qf d dxb cai', 5525, 105],
    ['qf d dxb bkk', 5525, 105],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dubai`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([
    ['qf d lhr hnd', 11700, 165],
    ['qf d lhr bkk', 11700, 165],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Europe`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );

  test.each([['qf d tlv hkg', 13000, 130]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Tel Aviv`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('calculate - jetstar rules', () => {
  test.each([
    ['jq BusinessMax syd mel', 1400, 40],
    ['jq BusinessMax syd asp', 2100, 60],
    ['jq BusinessMax syd per', 3300, 80],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Domestic Australia`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('Test for non Status Credit earning airlines', () => {
  test.each([
    ['af i cdg jfk', 5250, 0],
    ['af i jfk cdg', 5250, 0],
  ])(
    `Air France %s. Should earn %s qantas points and %s status credit`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(false);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('Test for non earning airline fare classes', () => {
  test.each([
    ['jq starter syd mel', 0, 0],
    ['jq starter syd mel', 0, 0],
  ])(
    `Jetatar %s. Should earn %s qantas points and %s status credit`,
    async (segmentString, expectedAirlinePoints, expectedElitePoints) => {
      const results = await calculate([buildSegmentFromString(segmentString)]);
      expect(results.containsErrors).toBe(true);
      expect(results.airlinePoints).toBe(expectedAirlinePoints);
      expect(results.elitePoints).toBe(expectedElitePoints);
    },
  );
});

describe('calculate - elite status levels', () => {
  test.each([
    ['qf e syd sin', 'Bronze', 2600, 0 * 2600],
    ['qf e syd sin', 'Silver', 2600, 0.5 * 2600],
    ['qf e syd sin', 'Gold', 2600, 0.75 * 2600],
    ['qf e syd sin', 'Platinum', 2600, 1 * 2600],
    ['qf e syd sin', 'Platinum One', 2600, 1 * 2600],

    ['qf g syd sin', 'Bronze', 3900, 0 * 3900],
    ['qf g syd sin', 'Silver', 3900, 0.5 * 3900],
    ['qf g syd sin', 'Gold', 3900, 0.75 * 3900],
    ['qf g syd sin', 'Platinum', 3900, 1 * 3900],
    ['qf g syd sin', 'Platinum One', 3900, 1 * 3900],

    ['qf d syd sin', 'Bronze', 8450, 0 * 5200],
    ['qf d syd sin', 'Silver', 8450, 0.5 * 5200],
    ['qf d syd sin', 'Gold', 8450, 0.75 * 5200],
    ['qf d syd sin', 'Platinum', 8450, 1 * 5200],
    ['qf d syd sin', 'Platinum One', 8450, 1 * 5200],
  ])(
    `Testing elite status pre July 2025 is applied for %s %s level`,
    async (segmentString, eliteStatus, expectedBaseAirlinePoints, expectedEliteBonus) => {
      const results = await calculate(
        [buildSegmentFromString(segmentString)],
        eliteStatus,
        0.0,
        false,
        true,
      );
      expect(results.containsErrors).toBe(false);
      expect(results.segmentResults[0].airlinePointsBreakdown.basePoints).toBe(
        expectedBaseAirlinePoints,
      );
      expect(results.airlinePoints).toBe(expectedBaseAirlinePoints + expectedEliteBonus);
    },
  );

  test.each([
    ['qf e syd sin', 'Bronze', 2600, 0 * 2600],
    ['qf e syd sin', 'Silver', 2600, 0.5 * 2600],
    ['qf e syd sin', 'Gold', 2600, 0.75 * 2600],
    ['qf e syd sin', 'Platinum', 2600, 1 * 2600],
    ['qf e syd sin', 'Platinum One', 2600, 1 * 2600],

    ['qf g syd sin', 'Bronze', 3900, 0 * 3900],
    ['qf g syd sin', 'Silver', 3900, 0.5 * 3900],
    ['qf g syd sin', 'Gold', 3900, 0.75 * 3900],
    ['qf g syd sin', 'Platinum', 3900, 1 * 3900],
    ['qf g syd sin', 'Platinum One', 3900, 1 * 3900],

    ['qf d syd sin', 'Bronze', 8450, 0 * 8450],
    ['qf d syd sin', 'Silver', 8450, Math.floor(0.5 * 8450)],
    ['qf d syd sin', 'Gold', 8450, Math.floor(0.75 * 8450)],
    ['qf d syd sin', 'Platinum', 8450, 1 * 8450],
    ['qf d syd sin', 'Platinum One', 8450, 1 * 8450],
  ])(
    `Testing elite status post July 2025 is applied for %s %s level`,
    async (segmentString, eliteStatus, expectedBaseAirlinePoints, expectedEliteBonus) => {
      const results = await calculate(
        [buildSegmentFromString(segmentString)],
        eliteStatus,
        0.0,
        false,
        false,
      );
      expect(results.containsErrors).toBe(false);
      expect(results.segmentResults[0].airlinePointsBreakdown.basePoints).toBe(
        expectedBaseAirlinePoints,
      );
      expect(results.airlinePoints).toBe(expectedBaseAirlinePoints + expectedEliteBonus);
    },
  );
});

describe('calculate - elite status only applies to certain airlines', () => {
  test.each([
    ['qf d syd sin', 'Silver', 8450, 0.5 * 5200],
    ['aa d syd sin', 'Silver', 5000, 0.5 * 4000],

    ['jq Flex sin bkk', 'Silver', 850, 0.5 * 850],
    ['3k Flex sin bkk', 'Silver', 850, 0.5 * 850],
    ['gk Flex sin bkk', 'Silver', 850, 0.5 * 850],

    ['cx d syd sin', 'Silver', 5000, 0],
    ['jl d syd sin', 'Silver', 5000, 0],
    ['ba d syd sin', 'Silver', 5000, 0],
    ['ib d syd sin', 'Silver', 5000, 0],
  ])(
    `Testing elite status is applied for %s %s level`,
    async (segmentString, eliteStatus, expectedBaseAirlinePoints, expectedEliteBonus) => {
      const results = await calculate([buildSegmentFromString(segmentString)], eliteStatus);
      expect(results.containsErrors).toBe(false);
      expect(results.segmentResults[0].airlinePointsBreakdown.basePoints).toBe(
        expectedBaseAirlinePoints,
      );
      expect(results.airlinePoints).toBe(expectedBaseAirlinePoints + expectedEliteBonus);
    },
  );
});

// TODO specific test for srilanka and malaysia?
// TODO min points calc?
