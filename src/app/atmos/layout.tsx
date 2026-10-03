import React, { Suspense } from "react";
import type { Metadata } from "next";

const title = "Atmos Rewards Points and Status Points Calculator";
const description =
  "Calculate Atmos Points and Status Points for Alaska Airlines, Hawaiian Airlines and partner flights, by distance, price paid or segments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/atmos" },
  openGraph: { url: "/atmos", title, description },
  twitter: { title, description },
};

export default function AtmosLayout({ children }: { children: React.ReactNode }) {
  /* Suspense because useSearchParams runs on startup */
  return <Suspense>{children}</Suspense>;
}
