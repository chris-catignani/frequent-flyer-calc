import { calculate } from "@/calculators/alaska/calculator";
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
        globalLocals: true,
      });
      expect([result.airlinePoints, result.elitePoints]).toEqual([500, 550]);
      expect(result.segmentResults[0].elitePointsBreakdown).toEqual({
        basePoints: 500,
        globalLocalsBonus: 50,
      });
    });

    it("treats US territories such as Guam as the US", async () => {
      const result = await calculate(segs("as _ sea gum"), "", {
        earnMethod: "segments",
        globalLocals: true,
      });
      expect(result.elitePoints).toBe(500);
    });

    it("does nothing when the member isn't in Global Locals", async () => {
      const result = await calculate(segs("as _ sea nrt"), "", { earnMethod: "segments" });
      expect(result.elitePoints).toBe(500);
    });
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

    it("gives the fare only to American flights on an American-issued ticket", async () => {
      const result = await calculate(segs("aa _ lax jfk", "ba y jfk lhr"), "", {
        earnMethod: "price",
        ticketIssuer: "american",
        fareUsd: 1000,
      });
      expect(result.segmentResults.map((r) => r.airlinePoints)).toEqual([5000, 1721]);
      expect(result.segmentResults[1].fareEarnCategory).toBe("economy");
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
