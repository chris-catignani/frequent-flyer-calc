import React from "react";

export const StructuredData: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://frequent-flyer-calc.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        name: "Qantas Frequent Flyer Points & Status Credits Calculator",
        url: `${baseUrl}/qantas`,
        description:
          "Accurately calculate Qantas Points and Status Credits for Qantas, Jetstar, and oneworld partner flights across all fare classes, routes, and elite status tiers.",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "AUD",
        },
        featureList: [
          "Qantas Points and Status Credits calculation",
          "Jetstar bundle earning calculations (Starter Plus, Flex, Max)",
          "oneworld alliance and partner airline earning tables",
          "Status tier multipliers (Bronze, Silver, Gold, Platinum, Platinum One)",
          "Multi-city segment routing and distance calculation",
          "Live comparison with official Qantas calculator",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How are Qantas Points and Status Credits calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Qantas Points and Status Credits are calculated per flight segment based on the marketing airline (the flight number booked), fare class, route, and great-circle distance bands published in Qantas and partner earning tables.",
            },
          },
          {
            "@type": "Question",
            name: "How do elite status tier bonuses work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Qantas Frequent Flyer members earn elite tier bonuses on eligible flights marketed by Qantas (QF), Jetstar (JQ/GK), and American Airlines (AA): Silver earns +50% points bonus, Gold earns +75%, and Platinum / Platinum One earn +100% points bonus. Status Credits do not receive percentage bonuses.",
            },
          },
          {
            "@type": "Question",
            name: "Which partner airlines earn Qantas Points and Status Credits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oneworld alliance partner airlines (such as American Airlines, British Airways, Cathay Pacific, Japan Airlines, Qatar Airways, Finnair, Iberia, Malaysia Airlines, Royal Jordanian, Royal Air Maroc, SriLankan Airlines, and Alaska Airlines) earn both Qantas Points and Status Credits. Non-oneworld partners (such as Emirates, LATAM, WestJet, and China Eastern) earn Qantas Points only.",
            },
          },
          {
            "@type": "Question",
            name: "Do Jetstar flights earn Qantas Points and Status Credits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Jetstar flights earn Qantas Points and Status Credits when booked with an eligible bundle: Economy Starter Plus, Flex, Flex Plus, Starter Max, or Business Max. Unbundled basic Economy Starter fares do not earn points or status credits.",
            },
          },
          {
            "@type": "Question",
            name: "Where can I find official Qantas earning tables and fare classes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Qantas publishes official earning tables with distance bands and eligible fare classes for Qantas and Jetstar flights, partner airline flights, and fare category tables on the Qantas website.",
            },
          },
          {
            "@type": "Question",
            name: "Why do some calculations differ slightly from the official Qantas calculator?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Minor discrepancies (usually 1-10 points) occasionally occur due to small great-circle distance calculation variances or specific domestic codeshare rules. Our calculator provides a 'Compare with Qantas' toggle to compare results directly against Qantas's live earnquote API.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
};
