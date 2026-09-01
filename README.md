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
