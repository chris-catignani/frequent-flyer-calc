import { Segment } from "@/models/segment";
import { calculate } from "./calculator";

describe("calculate - go path", () => {
  test("basic 1 segment test", () => {
    const segment = new Segment("aa", "i", "jfk", "lax");
    const result = calculate([segment], "Bronze");
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment,
          fareEarnCategory: "business",
          notes: "East Coast USA/Canada to West Coast USA/Canada",
          ruleName: "USA East Coast / Canada",
          ruleUrl: "https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-east-coast-usa-canada-and-",
          qantasPoints: 3125,
          statusCredits: 100,
          qantasPointsBreakdown: {
            basePoints: 3125,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 3125,
          },
        },
      ],
      containsErrors: false,
      statusCredits: 100,
      qantasPoints: 3125,
    });
  })

  test("2 segment test", () => {
    const segment1 = new Segment("aa", "i", "jfk", "lax");
    const segment2 = new Segment("aa", "i", "lax", "syd")
    const result = calculate([segment1, segment2], "Bronze");
    expect(result).toMatchObject({
      segmentResults: [
        {
          segment: segment1,
          fareEarnCategory: "business",
          notes: "East Coast USA/Canada to West Coast USA/Canada",
          ruleName: "USA East Coast / Canada",
          ruleUrl:
            "https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-east-coast-usa-canada-and-",
          qantasPoints: 3125,
          statusCredits: 100,
          qantasPointsBreakdown: {
            basePoints: 3125,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 3125,
          },
        },
        {
          segment: segment2,
          fareEarnCategory: "business",
          notes: "sydney to West Coast USA/Canada",
          ruleName: "Syndey, Melbourne, Brisbane, Gold Coast",
          ruleUrl:
            "https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html#between-syd-mel-bne-ool-and-",
          qantasPoints: 13500,
          statusCredits: 180,
          qantasPointsBreakdown: {
            basePoints: 13500,
            eliteBonus: {},
            minPoints: undefined,
            totalEarned: 13500,
          },
        },
      ],
      containsErrors: false,
      statusCredits: 280,
      qantasPoints: 16625,
    });
  });
})

describe("calculate - partner rules", () => {
  test.each([
    ["aa i syd sfo", 13500, 180],
    ["aa i syd jfk", 18600, 280],
    ["aa i syd dfw", 14700, 200],
    ["cx i syd hkg", 5600, 60],
    ["jl i mel hnd", 6000, 60],
    ["qr i bne doh", 7400, 80],
    ["ba i mel lhr", 13125, 140],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Sydney, Melbourne, Brisbane, Gold Coast and`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["cx i per hkg", 4700, 120],
    ["qr i per doh", 5800, 120],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Perth and`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["cx i adl hkg", 5400, 100],
    ["qr i adl doh", 7000, 90],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Adelaide and`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([["cx i cns hkg", 4250, 50]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Cairns and`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["cx i lhr hkg", 7400, 120],
    ["ba i lhr bkk", 7400, 120],
    ["ba i lhr kul", 8125, 120],
    ["jl i hnd cdg", 7400, 120],
    ["qr i mad doh", 3000, 60],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Western Europe`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["cx i hel hkg", 6125, 120],
    ["ba i hel bkk", 6125, 120],
    ["jl i hnd hel", 6125, 120],
    ["qr i hel doh", 3000, 60],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Northern Europe`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([["qr i doh ist", 1800, 50]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Southern Europe`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([["cx i hkg tlv", 6000, 60]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Tel Aviv`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["qr i doh bkk", 4250, 100],
    ["qr i doh sin", 4250, 100],
    ["qr i doh kul", 4250, 100],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dubai Doha`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["aa i jfk bos", 400, 40],
    ["aa i jfk ord", 750, 40],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Intra USA Short Haul`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([["aa i jfk lax", 3125, 100]])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for East Coast USA/Canada`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["aa i akl lax", 12000, 160],
    ["aa i akl dfw", 12750, 170],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for New Zealand`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["aa i dfw sfo", 3125, 100],
    ["aa i dfw bos", 1875, 80],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dallas`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  describe("calculate - qantas rules", () => {
    test.each([
      ["qf i syd mel", 1400, 40],
      ["qf i syd asp", 2100, 60],
      ["qf i syd per", 3300, 80],
    ])(
      `Testing routing %s. Should earn %s qantas points and %s status credit for Domestic Australia`,
      (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        const results = calculate([Segment.fromString(segmentString)]);
        expect(results.qantasPoints).toBe(expectedQantasPoints);
        expect(results.statusCredits).toBe(expectedStatusCredits);
      }
    );

    test.each([
      ["qf d syd akl", 2700, 85],
      ["qf d syd bkk", 8450, 125],
      ["qf d syd hnd", 8450, 125],
      ["qf d mel hnl", 9750, 150],
      ["qf d adl dfw", 15950, 210],
      ["qf d bne lax", 14625, 190],
      ["qf d ool jfk", 20150, 295],
    ])(
      `Testing routing %s. Should earn %s qantas points and %s status credit for Adelaide, Brisbane, Gold Coast, Melbourne, Sydney`,
      (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        const results = calculate([Segment.fromString(segmentString)]);
        expect(results.qantasPoints).toBe(expectedQantasPoints);
        expect(results.statusCredits).toBe(expectedStatusCredits);
      }
    );

    test.each([
      ["qf d drw bkk", 4400, 100],
      ["qf d per hnd", 8125, 125],
      ["qf d drw dxb", 9750, 150],
      ["qf d per lhr", 15300, 255],
    ])(
      `Testing routing %s. Should earn %s qantas points and %s status credit for Darwin, Perth`,
      (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        const results = calculate([Segment.fromString(segmentString)]);
        expect(results.qantasPoints).toBe(expectedQantasPoints);
        expect(results.statusCredits).toBe(expectedStatusCredits);
      }
    );

    test.each([
      ["qf d akl dfw", 13835, 180],
      ["qf d akl scl", 9450, 150],
      ["qf d akl jfk", 17450, 210],
    ])(
      `Testing routing %s. Should earn %s qantas points and %s status credit for New Zealand`,
      (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        const results = calculate([Segment.fromString(segmentString)]);
        expect(results.qantasPoints).toBe(expectedQantasPoints);
        expect(results.statusCredits).toBe(expectedStatusCredits);
      }
    );
  })

  test.each([
    ["qf d dfw jfk", 4200, 85],
    ["qf d dfw lax", 5525, 105],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dallas`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["qf d jfk lax", 5525, 105],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for USA East Coast`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["qf d dxb lhr", 5525, 105],
    ["qf d dxb cai", 5525, 105],
    ["qf d dxb bkk", 5525, 105],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Dubai`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["qf d lhr hnd", 11700, 165],
    ["qf d lhr bkk", 11700, 165],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Europe`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  test.each([
    ["qf d tlv hkg", 13000, 130],
  ])(
    `Testing routing %s. Should earn %s qantas points and %s status credit for Tel Aviv`,
    (segmentString, expectedQantasPoints, expectedStatusCredits) => {
      const results = calculate([Segment.fromString(segmentString)]);
      expect(results.qantasPoints).toBe(expectedQantasPoints);
      expect(results.statusCredits).toBe(expectedStatusCredits);
    }
  );

  // TODO specific test for srilanka and malaysia?
});
