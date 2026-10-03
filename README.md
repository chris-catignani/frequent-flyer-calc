This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Atmos Rewards (Alaska Airlines / Hawaiian Airlines)

The `/alaska` calculator estimates Atmos Rewards points and status points. It supports three earning methods:

- **Distance**: points based on miles flown.
- **Price Paid**: points per dollar spent, depending on the ticket issuer (Alaska 027, American 001, or another partner airline), with partner tickets using the fare-class cabin chart.
- **Segments**: a flat amount per flight segment.

Assumptions this calculator makes:

- Elite bonuses on partner-chart flights are calculated on the base points column.
- Price-paid ticket totals are split across flights in proportion to distance.
- Guam, Puerto Rico and other US territories count as the United States for Global Locals.
- On American-issued (001) tickets, flights not operated under an American flight number use the other partner earn chart.

Sources:

- [Choose how you earn](https://www.alaskaair.com/content/earn-points/choose-how-you-earn)
- [Partner earn chart](https://www.alaskaair.com/content/earn-points/flights/2027)

## Testing

- `npm test`: Run Jest unit tests
- `npm run test:e2e`: Run Playwright E2E tests (Chromium, runs against dedicated test server on port 3001)
- `npm run test:e2e:ui`: Run Playwright tests with interactive UI
- `npm run test:e2e:show`: Open Playwright HTML test report

## Environment Variables

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (or `NEXT_PUBLIC_POSTHOG_KEY`): PostHog Project API token for analytics, pageviews, and discrepancy tracking. Reverse-proxied via `/api/posthog/*`.

## Continuous Integration

PR checks (`lint-and-test`, `e2e`) run automatically on self-hosted Docker runners via GitHub Actions (`.github/workflows/ci.yml`).

## Known Discrepancies

Flights where this calc and Qantas official calculator are not in sync:

- China Airlines PVG-SZX
- American Airlines DFW-LAX
