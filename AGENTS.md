## What this is

A Next.js (App Router) app that calculates Qantas Frequent Flyer points/status credit earnings for a given flight itinerary. `/qantas` is the (only) live route; `/` redirects to it.

## Commands

- `npm run dev` — start dev server (Turbopack) at localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run typecheck` — TypeScript typecheck (`tsc --noEmit`)
- `npm run lint` — ESLint with cache, flat config in `eslint.config.mjs` (`eslint-config-next` + `eslint-config-prettier`)
- `npm run format` — Prettier write across repository
- `npm test` — Jest unit tests (jsdom environment, via `next/jest`)
- `npm run test:e2e` — Playwright E2E tests (Chromium, runs against port 3001)
- `npm run test:e2e:ui` — Playwright interactive UI mode
- `npm run test:e2e:show` — View Playwright HTML report
- Single unit test file: `npx jest path/to/file.test.ts`
- Single test by name: `npx jest -t "test name"`

A husky pre-commit hook runs `prettier --write` and `eslint --cache` on staged files via `lint-staged`. PR checks (`lint-and-test`, `e2e`) run via GitHub Actions on self-hosted Docker runners (`.github/workflows/ci.yml`).

## Architecture

### Calculation pipeline

`calculate(segments, eliteStatus, priceLessTaxes)` (`src/app/_shared/calculators/qantas/calculator.ts`)
is the calculation entry point, called directly from `src/app/qantas/page.tsx`. It takes an array of
`Segment` (one flight leg: airline, fare class, from/to airport) and returns
`{ segmentResults, containsErrors, elitePoints, airlinePoints }`, recording a per-segment error for
unsupported airlines rather than failing the whole calculation. For each segment it:

1. Determines a **fare earn category** (e.g. `discountEconomy`, `flexibleBusiness`) by mapping the
   segment's raw fare class letter through `qantasEarnCategories.ts` (`qf`/`jq`/`gk`) or
   `partnerEarnCategories.ts` (oneworld/other partners), driven by data tables copy-pasted from the
   Qantas website and parsed by `buildFareBuckets` in `earnCategories.ts`.
2. Finds the first matching **rule** for that airline from `qantasRules.ts` or `partnerRules.ts` (maps
   of `airlineCode -> Rule[]`) via `rule.applies(segment, fareEarnCategory)`, then calls
   `rule.calculate(...)` on the match.
3. Applies elite-status earning bonuses (`aa`, `qf`, `jq`, `gk` only) and enforces per-fare-class
   minimum points floors (Qantas Group only; a `Rule` can override the floor for its own route, e.g.
   Jetstar Domestic New Zealand).

Rules extend base classes in `rules.ts`: `DistanceRule` (great-circle distance bands, see
`calcDistance` in `utils/airports.ts`), `IntraCountryRule` (a `DistanceRule` scoped to one country),
`GeographicalRule` (city/country/region pairs, see `regions.ts`, checked in both directions), and
`FareClassRule` (flat per-fare-class, no geography). Each `*Rules.ts` file hand-authors `build*Rule()`
factories pasting Qantas's earn-rate tables via `parseEarningRates`/`parsePartnerEarningRates`
(whitespace-delimited points-per-fare-class strings, parsed positionally against `QANTAS_FARE_CLASSES`).
Rules are evaluated in declaration order per airline with a distance-banded fallback last, so rule
order matters. `rules.test.ts`, `qantasEarnCategories.test.ts`, `partnerEarnCategories.test.ts` and
`calculator.test.ts` are the tests to extend when touching this logic; `testUtils.ts` (`buildSegment`,
`buildSegmentFromString`) builds test segments.

These data strings are a faithful copy of Qantas's own tables, quirks included — if the live site has
a typo, fix the parser (`rules.ts`) to tolerate it rather than "correcting" the string, since a future
re-copy-paste would otherwise reintroduce the bug. This data drifts from Qantas's site periodically;
spot-check against the earn-category-tables, qantas-and-jetstar-earning-tables, and
partner-airline-earning-tables pages on qantas.com when earnings look off.

An optional live comparison mode (`compareWithQantasCalc`) calls `/api/qantas`, a thin proxy to
Qantas's own public `earnquote` API, to diff results against Qantas's own calculator; the README notes
known divergent routes. Airline groupings/constants live in `_shared/models/constants.ts`
(alliance-level: `ONEWORLD_AIRLINES`, `SKYTEAM_AIRLINES`, etc.) and
`_shared/models/qantasConstants.ts` (Qantas-specific: fare class tables per sub-fleet, `JAL_AIRLINES`,
`JETSTAR_AIRLINES`, `PARTNER_AIRLINES`, region display names).

### Page/component structure

- `src/app/qantas/page.tsx` is the main calculator UI (client component), owning all form state
  (segments, elite status, trip type). Input state round-trips through query params
  (`utils/segmentInputUrlParser.ts`) for deep-linking, hydrated via `useSearchParams`. Recent
  calculations persist client-side via `utils/recentCalculations.ts` (localStorage). `_components/`
  holds page-specific pieces (`input.tsx`, `resultsSummary.tsx`, `segmentResults.tsx`,
  `recentCalculations.tsx`, `footer.tsx`).
- `src/app/_shared/components/` holds cross-page input widgets: `segmentInput.tsx` (list/validation,
  `validate()`/`buildAirlineOptions()`), `autocomplete.tsx`, `advancedInput.tsx` (bulk entry).
- `src/app/_shared/models/` holds plain data classes (`Segment`, `Route`, `Earnings`, `SegmentInput`)
  — mutable JS classes with a `.clone({...})` pattern for partial updates, not immutable records.

### Analytics

PostHog (`posthog-js`, initialized in `_shared/components/posthogProvider.tsx`) captures `$pageview`, `calculation_completed`, and `qantas_api_mismatch` (via `utils/analytics.ts`). Next.js `rewrites()` in `next.config.mjs` reverse-proxies `/api/posthog/*` to avoid ad-blocker drops. Requires `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`; suppressed in `development`.

### Path aliases and styling

`@/*` maps to `src/*` (see `tsconfig.json`). Styling is MUI (`@mui/material`) + Emotion with Roboto
via `@fontsource/roboto`; `src/theme.ts` defines the MUI theme, wired up via `@mui/material-nextjs`
in `src/app/layout.tsx`.
