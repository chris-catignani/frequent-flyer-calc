import React from "react";
import { render } from "@testing-library/react";
import { StructuredData } from "./structuredData";

interface SchemaObject {
  "@type": string;
  [key: string]: unknown;
}

describe("StructuredData", () => {
  it("renders a valid JSON-LD script containing WebApplication and FAQPage schemas", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.innerHTML);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toBeDefined();
    expect(json["@graph"]).toHaveLength(2);

    const webApp = (json["@graph"] as SchemaObject[]).find(
      (item) => item["@type"] === "WebApplication"
    );
    expect(webApp).toBeDefined();
    expect(webApp?.name).toBe("Qantas Frequent Flyer Points & Status Credits Calculator");
    expect(webApp?.applicationCategory).toBe("TravelApplication");

    const faq = (json["@graph"] as SchemaObject[]).find((item) => item["@type"] === "FAQPage");
    expect(faq).toBeDefined();
    expect((faq?.mainEntity as unknown[]).length).toBeGreaterThanOrEqual(5);
  });
});
