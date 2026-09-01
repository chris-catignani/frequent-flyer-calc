import robots from "./robots";

describe("robots", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should allow root, disallow /api/, and specify sitemap with default base URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    const result = robots();
    expect(result.rules).toEqual([
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ]);
    expect(result.sitemap).toBe("https://frequent-flyer-calc.vercel.app/sitemap.xml");
  });

  it("should use NEXT_PUBLIC_SITE_URL for sitemap URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com";

    const result = robots();
    expect(result.sitemap).toBe("https://custom-domain.com/sitemap.xml");
  });
});
