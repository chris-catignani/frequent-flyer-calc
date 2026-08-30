import React, { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qantas Points and Status Credits Calculator',
  description: 'Calculate Qantas Points and Status Credits for multi segment itineraries',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* Putting <Suspense></Suspense> here because we use useSearchParams on startup */
  /* https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */
  return <Suspense>{children}</Suspense>;
}
