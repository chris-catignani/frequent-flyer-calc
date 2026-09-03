import {
  calcDistance,
  getAirport,
  getAirportsForCity,
  getAirportsForCountry,
  searchAirports,
} from "@/utils/airports";

describe("searchAirports", () => {
  test("returns empty array for an empty query", () => {
    expect(searchAirports("")).toEqual([]);
  });

  test("returns empty array for a whitespace-only query", () => {
    expect(searchAirports("   ")).toEqual([]);
  });

  test("returns empty array when nothing matches", () => {
    expect(searchAirports("zzzzzzz")).toEqual([]);
  });

  test("ranks an exact IATA code match first, ahead of city-name matches for other airports", () => {
    const results = searchAirports("syd", 3);
    expect(results[0].iata).toBe("SYD");
    expect(results[0].city).toBe("Sydney");
  });

  test("matches are case-insensitive", () => {
    const results = searchAirports("SYD", 3);
    expect(results[0].iata).toBe("SYD");
  });

  test("ranks a city-prefix match ahead of a name-substring-only match", () => {
    const results = searchAirports("lon", 150);
    const lhrIndex = results.findIndex((airport) => airport.iata === "LHR");
    const yazIndex = results.findIndex((airport) => airport.iata === "YAZ");
    expect(lhrIndex).toBeGreaterThanOrEqual(0);
    expect(yazIndex).toBeGreaterThanOrEqual(0);
    expect(lhrIndex).toBeLessThan(yazIndex);
  });

  test("returns multiple airports for a city with more than one airport", () => {
    const results = searchAirports("new york", 10);
    const iatas = results.map((airport) => airport.iata);
    expect(iatas).toEqual(expect.arrayContaining(["JFK", "LGA"]));
  });

  test("enforces an explicit limit", () => {
    const results = searchAirports("a", 5);
    expect(results.length).toBe(5);
  });

  test("defaults to a limit of 25 when none is given", () => {
    const results = searchAirports("a");
    expect(results.length).toBe(25);
  });
});

describe("getAirport", () => {
  test("returns correct airport for uppercase and lowercase IATA codes", () => {
    const upper = getAirport("SYD");
    const lower = getAirport("syd");
    expect(upper).not.toBeNull();
    expect(upper?.iata).toBe("SYD");
    expect(upper?.city).toBe("Sydney");
    expect(lower).toBe(upper);
  });

  test("returns null for unknown IATA or empty/whitespace input", () => {
    expect(getAirport("ZZZ")).toBeNull();
    expect(getAirport("")).toBeNull();
    expect(getAirport("   ")).toBeNull();
  });

  test("resolves newly added airports: SAI and BER", () => {
    const sai = getAirport("SAI");
    expect(sai).not.toBeNull();
    expect(sai?.iata).toBe("SAI");
    expect(sai?.name).toBe("Siem Reap-Angkor International Airport");
    expect(sai?.city).toBe("Siem Reap");
    expect(sai?.country).toBe("Cambodia");

    const ber = getAirport("BER");
    expect(ber).not.toBeNull();
    expect(ber?.iata).toBe("BER");
    expect(ber?.name).toBe("Berlin Brandenburg Airport");
    expect(ber?.city).toBe("Berlin");
    expect(ber?.country).toBe("Germany");
  });
});

describe("getAirportsForCity", () => {
  test("returns airports for valid city case-insensitively", () => {
    const upper = getAirportsForCity("Sydney");
    const lower = getAirportsForCity("sydney");
    expect(upper.length).toBeGreaterThan(0);
    expect(upper.some((a) => a.iata === "SYD")).toBe(true);
    expect(lower).toEqual(upper);
  });

  test("returns empty array for unknown city or empty string", () => {
    expect(getAirportsForCity("Atlantis")).toEqual([]);
    expect(getAirportsForCity("")).toEqual([]);
    expect(getAirportsForCity("   ")).toEqual([]);
  });
});

describe("getAirportsForCountry", () => {
  test("returns airports for valid country case-insensitively", () => {
    const upper = getAirportsForCountry("Australia");
    const lower = getAirportsForCountry("australia");
    expect(upper.length).toBeGreaterThan(0);
    expect(upper.some((a) => a.iata === "SYD")).toBe(true);
    expect(lower).toEqual(upper);
  });

  test("returns empty array for unknown country or empty string", () => {
    expect(getAirportsForCountry("Atlantis")).toEqual([]);
    expect(getAirportsForCountry("")).toEqual([]);
    expect(getAirportsForCountry("   ")).toEqual([]);
  });
});

describe("immutability", () => {
  test("returns frozen airport objects that cannot be mutated in strict mode", () => {
    const syd = getAirport("SYD");
    expect(syd).not.toBeNull();
    expect(Object.isFrozen(syd)).toBe(true);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getAirport("SYD") as any).city = "Mutated";
    }).toThrow();
  });

  test("returns frozen airport arrays for city and country lookups", () => {
    const cityAirports = getAirportsForCity("Sydney");
    expect(Object.isFrozen(cityAirports)).toBe(true);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cityAirports as any).push({} as any);
    }).toThrow();

    const countryAirports = getAirportsForCountry("Australia");
    expect(Object.isFrozen(countryAirports)).toBe(true);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (countryAirports as any).push({} as any);
    }).toThrow();
  });
});

describe("calcDistance", () => {
  test("calculates route distance parity on benchmark city pairs", () => {
    const syd = getAirport("SYD")!;
    const mel = getAirport("MEL")!;
    const jfk = getAirport("JFK")!;
    const lax = getAirport("LAX")!;
    const sin = getAirport("SIN")!;
    const lhr = getAirport("LHR")!;
    const per = getAirport("PER")!;
    const hnd = getAirport("HND")!;
    const cts = getAirport("CTS")!;

    // Distances using OurAirports coordinates:
    // SYD - MEL: 438 mi (legacy benchmark: 439 mi, diff: 1 mi)
    // JFK - LAX: 2469 mi (legacy benchmark: 2475 mi, diff: 6 mi)
    // SIN - SYD: 3910 mi (legacy benchmark: 3907 mi, diff: 3 mi)
    // LHR - PER: 9014 mi (legacy benchmark: 9008 mi, diff: 6 mi)
    // HND - CTS: 509 mi (legacy benchmark: 510 mi, diff: 1 mi)
    expect(calcDistance(syd, mel)).toBe(438);
    expect(calcDistance(jfk, lax)).toBe(2469);
    expect(calcDistance(sin, syd)).toBe(3910);
    expect(calcDistance(lhr, per)).toBe(9014);
    expect(calcDistance(hnd, cts)).toBe(509);

    // Verify distance parity within 0.25% (<= 6 miles) of legacy benchmark pairs
    expect(Math.abs(calcDistance(syd, mel) - 439)).toBeLessThanOrEqual(1);
    expect(Math.abs(calcDistance(jfk, lax) - 2475)).toBeLessThanOrEqual(6);
    expect(Math.abs(calcDistance(sin, syd) - 3907)).toBeLessThanOrEqual(3);
    expect(Math.abs(calcDistance(lhr, per) - 9008)).toBeLessThanOrEqual(6);
    expect(Math.abs(calcDistance(hnd, cts) - 510)).toBeLessThanOrEqual(1);
  });
});
