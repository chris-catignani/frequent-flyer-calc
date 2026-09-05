import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PostHogProvider } from "@/components/common/posthogProvider";
import { StructuredData } from "@/components/common/structuredData";
import type { Metadata } from "next";
import React from "react";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://frequent-flyer-calc.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Qantas Frequent Flyer Points & Status Credits Calculator",
    template: "%s | Frequent Flyer Calculator",
  },
  description:
    "Calculate Qantas Points and Status Credits accurately for Qantas, Jetstar, and oneworld partner flights across all fare classes, routes, and elite status tiers.",
  keywords: [
    "Qantas frequent flyer calculator",
    "Qantas points calculator",
    "status credits calculator",
    "Qantas status run",
    "oneworld earn rates",
    "Jetstar points calculator",
    "Qantas frequent flyer status",
  ],
  authors: [
    { name: "delighted5153", url: "https://www.flyertalk.com/forum/members/delighted5153.html" },
  ],
  creator: "delighted5153",
  alternates: {
    canonical: "/qantas",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/qantas",
    siteName: "Qantas Frequent Flyer Calculator",
    title: "Qantas Frequent Flyer Points & Status Credits Calculator",
    description:
      "Fast, accurate calculator for Qantas Points and Status Credits on Qantas, Jetstar, and partner airlines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qantas Frequent Flyer Points & Status Credits Calculator",
    description:
      "Fast, accurate calculator for Qantas Points and Status Credits on Qantas, Jetstar, and partner airlines.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <StructuredData />
      </head>
      <body>
        <PostHogProvider>
          <Analytics />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
