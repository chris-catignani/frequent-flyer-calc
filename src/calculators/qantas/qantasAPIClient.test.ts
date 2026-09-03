import { fetchDataFromQantas } from "./qantasAPIClient";
import { buildSegment } from "@/test/testUtils";

describe("qantasAPIClient", () => {
  const originalFetch = global.fetch;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  const sampleSegment = buildSegment("qf", "Y", "SYD", "MEL");

  it("returns qantasData when matching reward entry is returned", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        rewards: {
          "1": {
            fare_class: "Economy",
            earn: 800,
            base: 800,
            cabin_bonus: 0,
            status_credits: 10,
          },
        },
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeUndefined();
    expect(result.qantasData).toEqual({
      airlinePoints: 800,
      basePoints: 800,
      eliteBonus: 0,
      elitePoints: 10,
    });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("extracts error message from non-OK response with error field", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: "Missing required query parameters: eliteStatus",
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Missing required query parameters: eliteStatus");
  });

  it("extracts errorMessage from non-OK response with errorMessage field", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        errorMessage: "No routes found",
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("No routes found");
  });

  it("handles non-OK response when error response is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Qantas API request failed with status 502");
  });

  it("handles network failure gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network connection lost"));

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Network connection lost");
  });

  it("returns error and logs when no matching earn category is found", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        rewards: {
          "1": {
            fare_class: "Business",
            earn: 1200,
            base: 1200,
            cabin_bonus: 0,
            status_credits: 20,
          },
        },
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Failed to find a matching Qantas API result");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to find a matching Qantas API result",
      sampleSegment,
      "Bronze",
      "economy",
      expect.anything()
    );
  });

  it("handles errorMessage field in 200 response and logs error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        errorMessage: "Fare quote error",
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Fare quote error");
    expect(consoleSpy).toHaveBeenCalledWith("Qantas API returned an error: Fare quote error");
  });

  it("handles error field in 200 response and logs error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        error: "Proxy route error",
      }),
    } as Response);

    const result = await fetchDataFromQantas(sampleSegment, "Bronze", "economy");

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Proxy route error");
    expect(consoleSpy).toHaveBeenCalledWith("Qantas API returned an error: Proxy route error");
  });
});
