import { parseEncodedTextItin, parseItaMatrixInput } from "./segmentInputParser";

describe("segmentInputParser", () => {
  describe("parseEncodedTextItin", () => {
    it("returns error for empty or blank text itinerary", () => {
      expect(parseEncodedTextItin("", "\n", " ")).toEqual({
        segmentInputs: [],
        parsingError: "Text itinerary is required",
      });
    });

    it("returns error when a segment does not have 4 parts", () => {
      const result = parseEncodedTextItin("QF SYD MEL", "\n", " ");
      expect(result.segmentInputs).toEqual([]);
      expect(result.parsingError).toContain("is not formatted correctly");
    });

    it("parses valid encoded text itinerary", () => {
      const result = parseEncodedTextItin("QF SYD MEL Y\nAA LAX JFK J", "\n", " ");
      expect(result.parsingError).toBeUndefined();
      expect(result.segmentInputs).toHaveLength(2);
      expect(result.segmentInputs[0].airline).toBe("qf");
      expect(result.segmentInputs[0].fromAirportText).toBe("syd");
      expect(result.segmentInputs[0].toAirportText).toBe("mel");
      expect(result.segmentInputs[0].fareClass).toBe("y");
      expect(result.segmentInputs[1].airline).toBe("aa");
      expect(result.segmentInputs[1].fareClass).toBe("j");
    });

    it("maps Jetstar letter fare classes correctly", () => {
      const result = parseEncodedTextItin("JQ SYD MEL Starter", "\n", " ");
      expect(result.parsingError).toBeUndefined();
      expect(result.segmentInputs[0].fareClass).toBe("starter");
    });
  });

  describe("parseItaMatrixInput", () => {
    it("returns error for empty string", () => {
      expect(parseItaMatrixInput("")).toEqual({
        segmentInputs: [],
        parsingError: "ITA Matrix JSON required",
      });
    });

    it("returns error on invalid JSON and does not call console.log", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const result = parseItaMatrixInput("not-valid-json{");
      expect(result).toEqual({
        segmentInputs: [],
        parsingError: "Invalid JSON format",
      });
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("returns error when itinerary or slices are missing or slices is not an array", () => {
      expect(parseItaMatrixInput("{}")).toEqual({
        segmentInputs: [],
        parsingError: "ITA Matrix JSON missing itinerary, or slices",
      });

      expect(parseItaMatrixInput(JSON.stringify({ itinerary: {} }))).toEqual({
        segmentInputs: [],
        parsingError: "ITA Matrix JSON missing itinerary, or slices",
      });

      expect(parseItaMatrixInput(JSON.stringify({ itinerary: { slices: {} } }))).toEqual({
        segmentInputs: [],
        parsingError: "ITA Matrix JSON missing itinerary, or slices",
      });

      expect(parseItaMatrixInput(JSON.stringify({ itinerary: { slices: [] } }))).toEqual({
        segmentInputs: [],
        parsingError: "ITA Matrix JSON missing itinerary, or slices",
      });
    });

    it("parses valid ITA Matrix JSON", () => {
      const validIta = {
        itinerary: {
          slices: [
            {
              segments: [
                {
                  carrier: { code: "QF" },
                  bookingInfos: [{ bookingCode: "Y" }],
                  legs: [{ origin: { code: "SYD" }, destination: { code: "MEL" } }],
                },
              ],
            },
          ],
        },
      };

      const result = parseItaMatrixInput(JSON.stringify(validIta));
      expect(result.parsingError).toBeUndefined();
      expect(result.segmentInputs).toHaveLength(1);
      expect(result.segmentInputs[0].airline).toBe("qf");
      expect(result.segmentInputs[0].fareClass).toBe("y");
      expect(result.segmentInputs[0].fromAirportText).toBe("syd");
      expect(result.segmentInputs[0].toAirportText).toBe("mel");
    });

    it("handles empty bookingInfos without throwing TypeError", () => {
      const itaWithEmptyBookingInfos = {
        itinerary: {
          slices: [
            {
              segments: [
                {
                  carrier: { code: "QF" },
                  bookingInfos: [],
                  legs: [{ origin: { code: "SYD" }, destination: { code: "MEL" } }],
                },
              ],
            },
          ],
        },
      };

      expect(() => {
        const result = parseItaMatrixInput(JSON.stringify(itaWithEmptyBookingInfos));
        expect(result.parsingError).toBeUndefined();
        expect(result.segmentInputs).toHaveLength(1);
        expect(result.segmentInputs[0].fareClass).toBe("");
      }).not.toThrow();
    });

    it("handles missing carrier, legs, or malformed segments defensively", () => {
      const itaWithMissingFields = {
        itinerary: {
          slices: [
            {
              segments: [
                {
                  // missing carrier
                  bookingInfos: [{ bookingCode: "Y" }],
                  legs: [{ origin: { code: "SYD" }, destination: { code: "MEL" } }],
                },
                {
                  carrier: { code: "QF" },
                  // missing legs
                },
              ],
            },
          ],
        },
      };

      expect(() => {
        const result = parseItaMatrixInput(JSON.stringify(itaWithMissingFields));
        expect(result.parsingError).toBeUndefined();
        expect(result.segmentInputs).toHaveLength(1);
        expect(result.segmentInputs[0].airline).toBe("");
      }).not.toThrow();
    });
  });
});
