import { createUrlQueryParams, parseUrlQueryParams } from "./segmentInputUrlParser";
import { createSegmentInput } from "@/models/segmentInput";

describe("segmentInputUrlParser", () => {
  it("encodes and decodes segment inputs round-trip", () => {
    const inputs = [
      createSegmentInput("qf", "j", "syd", "mel"),
      createSegmentInput("va", "y", "mel", "bne"),
    ];

    const encoded = createUrlQueryParams("gold", inputs, "return");
    expect(encoded.eliteStatus).toBe("gold");
    expect(encoded.tripType).toBe("return");
    expect(encoded.segmentInputs).toBe("qf_syd_mel_j-va_mel_bne_y");

    const mockParams = {
      get: (key: string) => {
        if (key === "eliteStatus") return encoded.eliteStatus;
        if (key === "tripType") return encoded.tripType;
        if (key === "segmentInputs") return encoded.segmentInputs;
        return null;
      },
    };

    const parsed = parseUrlQueryParams(mockParams);
    expect(parsed.eliteStatus).toBe("gold");
    expect(parsed.tripType).toBe("return");
    expect(parsed.segmentInputs).toHaveLength(2);
    expect(parsed.segmentInputs![0].airline).toBe("qf");
    expect(parsed.segmentInputs![0].fareClass).toBe("j");
    expect(parsed.segmentInputs![0].fromAirportText).toBe("syd");
    expect(parsed.segmentInputs![0].toAirportText).toBe("mel");
    expect(parsed.segmentInputs![1].airline).toBe("va");
    expect(parsed.segmentInputs![1].fareClass).toBe("y");
  });

  it("handles null search params safely", () => {
    const parsed = parseUrlQueryParams(null);
    expect(parsed.eliteStatus).toBeNull();
    expect(parsed.tripType).toBeNull();
    expect(parsed.segmentInputs).toBeUndefined();
  });

  describe("program options", () => {
    const defaults = { earnMethod: "distance", fareUsd: 0, globalLocals: false };

    it("writes each program option as its own query param", () => {
      const params = createUrlQueryParams("Gold", [], "one way", {
        earnMethod: "price",
        fareUsd: 480.5,
        globalLocals: true,
      });
      expect(params).toMatchObject({ earnMethod: "price", fareUsd: "480.5", globalLocals: "true" });
    });

    it("adds no extra params when there are no program options", () => {
      expect(Object.keys(createUrlQueryParams("Gold", [], "one way")).sort()).toEqual([
        "eliteStatus",
        "segmentInputs",
        "tripType",
      ]);
    });

    it("parses only known keys and coerces values to the default's type", () => {
      const searchParams = new URLSearchParams(
        "earnMethod=price&fareUsd=480.5&globalLocals=true&bogus=1"
      );
      expect(parseUrlQueryParams(searchParams, defaults).programOptions).toEqual({
        earnMethod: "price",
        fareUsd: 480.5,
        globalLocals: true,
      });
    });

    it("drops values that don't match the default's type", () => {
      const searchParams = new URLSearchParams("fareUsd=abc&globalLocals=yes");
      expect(parseUrlQueryParams(searchParams, defaults).programOptions).toBeUndefined();
    });

    it("omits programOptions when the program has no defaults", () => {
      const searchParams = new URLSearchParams("earnMethod=price");
      expect(parseUrlQueryParams(searchParams)).not.toHaveProperty("programOptions");
    });
  });
});
