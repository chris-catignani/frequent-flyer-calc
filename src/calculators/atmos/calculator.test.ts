import { calculate } from "@/calculators/atmos/calculator";
import { buildSegmentFromString } from "@/test/testUtils";

const segs = (...strings: string[]) => strings.map(buildSegmentFromString);

describe("Atmos calculator", () => {
  describe("distance", () => {
    it("earns 1 point and 1 status point per mile on cash tickets", async () => {
      const result = await calculate(segs("as _ sea lax"), "Member", { earnMethod: "distance" });
      expect(result.airlinePoints).toBe(954);
      expect(result.elitePoints).toBe(954);
    });

    it("earns status points only on award tickets, with no elite bonus", async () => {
      const result = await calculate(segs("as _ sea lax"), "Titanium", {
        earnMethod: "distance",
        bookingType: "award",
      });
      expect(result.airlinePoints).toBe(0);
      expect(result.elitePoints).toBe(954);
    });

    it("applies the elite bonus to Atmos Points only", async () => {
      const result = await calculate(segs("as _ sea lax"), "Gold", { earnMethod: "distance" });
      expect(result.airlinePoints).toBe(954 + 477);
      expect(result.elitePoints).toBe(954);
    });
  });

  describe("segments", () => {
    it("earns 500/500 per cash segment and 0/500 per award segment", async () => {
      const cash = await calculate(segs("as _ sea lax", "as _ lax jfk"), "", {
        earnMethod: "segments",
      });
      expect([cash.airlinePoints, cash.elitePoints]).toEqual([1000, 1000]);

      const award = await calculate(segs("as _ sea lax"), "", {
        earnMethod: "segments",
        bookingType: "award",
      });
      expect([award.airlinePoints, award.elitePoints]).toEqual([0, 500]);
    });
  });

  describe("Global Locals", () => {
    it("adds 10% status points to flights touching a non-US airport", async () => {
      const result = await calculate(segs("as _ sea nrt"), "", {
        earnMethod: "segments",
        community: "globalLocals",
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([500, 550]);
      expect(result.segmentResults[0].elitePointsBreakdown).toEqual({
        basePoints: 500,
        communityBonus: 50,
      });
    });

    it("treats US territories such as Guam as the US", async () => {
      const result = await calculate(segs("as _ sea gum"), "", {
        earnMethod: "segments",
        community: "globalLocals",
      });
      expect(result.elitePoints).toBe(500);
    });

    it("does nothing when the member isn't in Global Locals", async () => {
      const result = await calculate(segs("as _ sea nrt"), "", { earnMethod: "segments" });
      expect(result.elitePoints).toBe(500);
    });
  });

  describe("Huakaʻi by Hawaiian", () => {
    it("adds 50% Atmos Points and status points on flights between the Hawaiian Islands", async () => {
      const result = await calculate(segs("ha _ hnl ogg"), "", {
        earnMethod: "segments",
        community: "huakai",
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([750, 750]);
      expect(result.segmentResults[0].airlinePointsBreakdown?.communityBonus).toBe(250);
      expect(result.segmentResults[0].elitePointsBreakdown?.communityBonus).toBe(250);
    });

    it("calculates the bonus on base points, alongside the elite bonus", async () => {
      const result = await calculate(segs("ha _ hnl lih"), "Gold", {
        earnMethod: "distance",
        community: "huakai",
      });
      const miles = result.segmentResults[0].airlinePointsBreakdown!.basePoints!;
      expect(result.airlinePoints).toBe(miles + Math.round(miles * 0.5) * 2);
      expect(result.elitePoints).toBe(miles + Math.round(miles * 0.5));
    });

    it("applies to price paid earning", async () => {
      const result = await calculate(segs("ha _ hnl koa"), "", {
        earnMethod: "price",
        fareUsd: 100,
        community: "huakai",
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([750, 750]);
    });

    it("adds only status points on award tickets", async () => {
      const result = await calculate(segs("ha _ hnl ito"), "", {
        earnMethod: "segments",
        bookingType: "award",
        community: "huakai",
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([0, 750]);
    });

    it("does nothing on flights to or from the mainland", async () => {
      const result = await calculate(segs("ha _ hnl lax"), "", {
        earnMethod: "segments",
        community: "huakai",
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([500, 500]);
    });
  });

  describe("communities without earning benefits", () => {
    it.each(["club49", "culinaryJourneys", "activeEscapes", "familiesOnTheGo"])(
      "%s earns the same as no community",
      async (community) => {
        const result = await calculate(segs("as _ sea nrt", "ha _ hnl ogg"), "", {
          earnMethod: "segments",
          community,
        });
        expect([result.airlinePoints, result.elitePoints]).toEqual([1000, 1000]);
      }
    );
  });

  describe("price paid — revenue earning", () => {
    it("earns 5 points per dollar on Alaska-issued tickets", async () => {
      const result = await calculate(segs("as _ sea lax"), "", {
        earnMethod: "price",
        fareUsd: 500,
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([2500, 2500]);
    });

    it("applies the Titanium bonus to the whole revenue base", async () => {
      const result = await calculate(segs("as _ sea lax"), "Titanium", {
        earnMethod: "price",
        fareUsd: 500,
      });
      expect(result.airlinePoints).toBe(6250);
      expect(result.elitePoints).toBe(2500);
    });

    it("floors the ticket total and splits it by distance, summing exactly", async () => {
      const result = await calculate(segs("as _ sea lax", "as _ lax jfk"), "", {
        earnMethod: "price",
        fareUsd: 500.19,
      });
      expect(result.segmentResults.map((r) => r.airlinePoints)).toEqual([697, 1803]);
      expect(result.airlinePoints).toBe(2500);
    });

    it("splits award redemptions into status points only", async () => {
      const result = await calculate(segs("as _ sea lax"), "Gold", {
        earnMethod: "price",
        bookingType: "award",
        pointsRedeemed: 25000,
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([0, 1250]);
    });

    it("gives American flights only their distance share of the fare on an American-issued ticket", async () => {
      const result = await calculate(segs("aa _ lax jfk", "ba y jfk lhr"), "", {
        earnMethod: "price",
        ticketIssuer: "american",
        fareUsd: 1000,
      });
      // LAX-JFK is 2,469 of the ticket's 5,911 miles; BA earns from the partner chart instead
      expect(result.segmentResults.map((r) => r.airlinePoints)).toEqual([2088, 1721]);
      expect(result.segmentResults.map((r) => r.elitePoints)).toEqual([2088, 1721]);
      expect(result.segmentResults[1].fareEarnCategory).toBe("economy");
    });

    it("gives every flight on an Alaska-issued ticket its share, partners included", async () => {
      const result = await calculate(segs("as _ sea lax", "ba y lax lhr"), "", {
        earnMethod: "price",
        fareUsd: 1000,
      });
      expect(result.airlinePoints).toBe(5000);
      expect(result.elitePoints).toBe(5000);
    });
  });

  describe("price paid — other partner earn chart", () => {
    const other = { earnMethod: "price", ticketIssuer: "other", fareUsd: 999 };

    it("earns 25% of distance in discount economy, with the elite bonus on base", async () => {
      const result = await calculate(segs("qr q doh lhr"), "Gold", other);
      expect(result.segmentResults[0].fareEarnCategory).toBe("discountEconomy");
      expect(result.airlinePoints).toBe(814 + 407);
      expect(result.elitePoints).toBe(814);
    });

    it("uses 250% for international business/first, with the elite bonus on the base column only", async () => {
      const result = await calculate(segs("ba f jfk lhr"), "Platinum", other);
      const [segmentResult] = result.segmentResults;
      expect(segmentResult.fareEarnCategory).toBe("internationalBusinessFirst");
      expect(segmentResult.airlinePointsBreakdown).toEqual({
        basePoints: 3442,
        cabinBonus: 5163,
        eliteBonus: { airlinePoints: 3442 },
        communityBonus: 0,
        totalEarned: 12047,
      });
      expect(result.elitePoints).toBe(8605);
    });

    it("uses 150% for domestic business/first", async () => {
      const result = await calculate(segs("aa f lax jfk"), "", other);
      expect(result.segmentResults[0].fareEarnCategory).toBe("domesticBusinessFirst");
      expect([result.airlinePoints, result.elitePoints]).toEqual([3704, 3704]);
    });

    it("gives STARLUX no status points when booked elsewhere", async () => {
      const result = await calculate(segs("jx j tpe nrt"), "", other);
      expect([result.airlinePoints, result.elitePoints]).toEqual([3388, 0]);
    });
  });

  describe("errors", () => {
    it("reports unsupported airlines per segment and excludes them from totals", async () => {
      const result = await calculate(segs("as _ sea lax", "ek y dxb lhr"), "", {
        earnMethod: "distance",
      });
      expect(result.containsErrors).toBe(true);
      expect(result.segmentResults[1].error).toBeInstanceOf(Error);
      expect(result.airlinePoints).toBe(954);
    });

    it("reports unknown partner fare classes", async () => {
      const result = await calculate(segs("qr z doh lhr"), "", {
        earnMethod: "price",
        ticketIssuer: "other",
      });
      expect(result.containsErrors).toBe(true);
      expect(String(result.segmentResults[0].error)).toContain("Z");
    });

    it("rejects Alaska/Hawaiian flights on partner-issued price-paid tickets", async () => {
      const result = await calculate(segs("as _ sea lax"), "", {
        earnMethod: "price",
        ticketIssuer: "other",
      });
      expect(result.containsErrors).toBe(true);
    });
  });
});
