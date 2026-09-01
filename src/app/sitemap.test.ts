import sitemap from "./sitemap";

describe("sitemap", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return the canonical /qantas route with default base URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    const result = sitemap();
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://frequent-flyer-calc.vercel.app/qantas");
    expect(result[0].priority).toBe(1.0);
    expect(result[0].changeFrequency).toBe("weekly");
  });

  it("should use NEXT_PUBLIC_SITE_URL when defined", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com";

    const result = sitemap();
    expect(result[0].url).toBe("https://custom-domain.com/qantas");
  });

  it("should use VERCEL_PROJECT_PRODUCTION_URL when defined without NEXT_PUBLIC_SITE_URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "my-deployment.vercel.app";

    const result = sitemap();
    expect(result[0].url).toBe("https://my-deployment.vercel.app/qantas");
  });
});
