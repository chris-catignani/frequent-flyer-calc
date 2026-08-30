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

## Environment Variables

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (or `NEXT_PUBLIC_POSTHOG_KEY`): PostHog Project API token for analytics, pageviews, and discrepancy tracking. Reverse-proxied via `/api/posthog/*`.

## Known Discrepancies

Flights where this calc and Qantas official calculator are not in sync:

- China Airlines PVG-SZX
- American Airlines DFW-LAX
