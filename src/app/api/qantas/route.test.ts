/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("/api/qantas route", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const createRequest = (params: Record<string, string>) => {
    const url = new URL("http://localhost:3000/api/qantas");
    Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
    return new NextRequest(url);
  };

  describe("query parameter validation", () => {
    it("returns 400 when required query parameters are missing", async () => {
      const req = createRequest({ airline: "QF", fromIata: "SYD" }); // missing toIata and eliteStatus
      const res = await GET(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Missing required query parameters");
    });

    it("returns 400 when parameters are empty strings", async () => {
      const req = createRequest({
        airline: "QF",
        fromIata: "SYD",
        toIata: "",
        eliteStatus: "Bronze",
      });
      const res = await GET(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("toIata");
    });
  });

  describe("upstream communication and error handling", () => {
    it("returns 200 with upstream JSON when fetch succeeds and does not console.log", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const mockPayload = { rewards: { "1": { earn: 1000 } } };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPayload,
      } as Response);

      const req = createRequest({
        airline: "QF",
        fromIata: "SYD",
        toIata: "MEL",
        eliteStatus: "Bronze",
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockPayload);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("returns upstream status and error payload when upstream returns error JSON and logs URL", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const mockErrorPayload = { errorMessage: "No routes found" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockErrorPayload,
      } as Response);

      const req = createRequest({
        airline: "QF",
        fromIata: "SYD",
        toIata: "XYZ",
        eliteStatus: "Bronze",
      });

      const res = await GET(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual(mockErrorPayload);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Qantas API error (404) for URL: https://api.services.qantasloyalty.com"
        ),
        mockErrorPayload
      );
      consoleErrorSpy.mockRestore();
    });

    it("returns upstream status and fallback error when upstream returns non-JSON error and logs URL", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: async () => {
          throw new Error("Unexpected HTML token");
        },
      } as unknown as Response);

      const req = createRequest({
        airline: "QF",
        fromIata: "SYD",
        toIata: "MEL",
        eliteStatus: "Bronze",
      });

      const res = await GET(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe("Service Unavailable");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Qantas API error (503) for URL: https://api.services.qantasloyalty.com"
        ),
        { error: "Service Unavailable" }
      );
      consoleErrorSpy.mockRestore();
    });

    it("returns 502 Bad Gateway when fetch throws network error and logs URL", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const networkError = new Error("Connection refused");
      global.fetch = jest.fn().mockRejectedValue(networkError);

      const req = createRequest({
        airline: "QF",
        fromIata: "SYD",
        toIata: "MEL",
        eliteStatus: "Bronze",
      });

      const res = await GET(req);
      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.error).toBe("Failed to fetch from Qantas API");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Qantas API fetch failed for URL: https://api.services.qantasloyalty.com"
        ),
        networkError
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
