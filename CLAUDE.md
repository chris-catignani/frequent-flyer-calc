## What this is

A Next.js (App Router) app that calculates frequent flyer points/status credit earnings for a given
flight itinerary, primarily for the Qantas Frequent Flyer program (with partial support for Finnair
and Malaysia Airlines programs). Live routes are `/qantas` (the main, actively developed calculator)
and `/oneworld` (an in-progress multi-program comparison tool — still seeded with hardcoded test data,
see the `TODO` in `src/app/oneworld/page.js`). `/` redirects to `/qantas`.

## Commands

- `npm run dev` — start dev server (Turbopack) at localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint, flat config in `eslint.config.mjs` (`eslint-config-next` + `eslint-config-prettier`)
- `npm run format` — Prettier write across `src/**/*.{js,jsx,ts,tsx,css,html}`
- `npm test` — Jest (jsdom environment, via `next/jest`)
- Single test file: `npx jest path/to/file.test.js`
- Single test by name: `npx jest -t "test name"`

A husky pre-commit hook runs `eslint --fix` on staged JS/TS files via lint-staged (Prettier is not
part of the hook). There is no CI config in this repo — everything else is run manually.

## Architecture

### Calculation pipeline

`Calculator.calculate(program, segments, eliteStatus, priceLessTaxes)`
(`src/app/_shared/calculators/calculator.js`) dispatches to one of three per-program calculators
(`finnair`, `malaysia`, `qantas`, each with their own `calculator.js`). Every calculator takes an
array of `Segment` (one flight leg: airline, fare class, from/to airport) and returns
`{ segmentResults, containsErrors, elitePoints, airlinePoints }`. Each program calculator
independently declares which airline codes it supports and throws/records a per-segment error for
unsupported airlines rather than failing the whole calculation.

### Qantas calculator (the core of the app)

`src/app/_shared/calculators/qantas/calculator.js` is the most developed calculator and the one worth
understanding in depth. For each segment it:

1. Determines a **fare earn category** (e.g. `discountEconomy`, `flexibleBusiness`) by mapping the
   segment's raw fare class letter through `qantasEarnCategories.js` (`qf`/`jq`/`gk`) or
   `partnerEarnCategories.js` (oneworld/other partners), driven by data tables copy-pasted from the
   Qantas website and parsed by `buildFareBuckets` in `earnCategories.js`.
2. Finds the first matching **rule** for that airline from `qantasRules.js` or `partnerRules.js` (maps
   of `airlineCode -> Rule[]`) via `rule.applies(segment, fareEarnCategory)`, then calls
   `rule.calculate(...)` on the match.
3. Applies elite-status earning bonuses (`aa`, `qf`, `jq`, `gk` only) and enforces per-fare-class
   minimum points floors (Qantas Group only; a `Rule` can override the floor for its own route, e.g.
   Jetstar Domestic New Zealand).

Rules extend base classes in `rules.js`: `DistanceRule` (great-circle distance bands, see
`calcDistance` in `utils/airports.js`), `IntraCountryRule` (a `DistanceRule` scoped to one country),
`GeographicalRule` (city/country/region pairs, see `regions.js`, checked in both directions), and
`FareClassRule` (flat per-fare-class, no geography). Each `*Rules.js` file hand-authors `build*Rule()`
factories pasting Qantas's earn-rate tables via `parseEarningRates`/`parsePartnerEarningRates`
(whitespace-delimited points-per-fare-class strings, parsed positionally against `QANTAS_FARE_CLASSES`).
Rules are evaluated in declaration order per airline with a distance-banded fallback last, so rule
order matters. `rules.test.js`, `qantasEarnCategories.test.js`, `partnerEarnCategories.test.js` and
`calculator.test.js` are the tests to extend when touching this logic; `testUtils.js` (`buildSegment`,
`buildSegmentFromString`) builds test segments.

These data strings are a faithful copy of Qantas's own tables, quirks included — if the live site has
a typo, fix the parser (`rules.js`) to tolerate it rather than "correcting" the string, since a future
re-copy-paste would otherwise reintroduce the bug. This data drifts from Qantas's site periodically;
spot-check against the earn-category-tables, qantas-and-jetstar-earning-tables, and
partner-airline-earning-tables pages on qantas.com when earnings look off.

An optional live comparison mode (`compareWithQantasCalc`) calls `/api/qantas`, a thin proxy to
Qantas's own public `earnquote` API, to diff results against Qantas's own calculator; the README notes
known divergent routes. Airline groupings/constants live in `_shared/models/constants.js`
(alliance-level: `ONEWORLD_AIRLINES`, `SKYTEAM_AIRLINES`, etc.) and
`_shared/models/qantasConstants.js` (Qantas-specific: fare class tables per sub-fleet, `JAL_AIRLINES`,
`JETSTAR_AIRLINES`, `PARTNER_AIRLINES`, region display names).

### Page/component structure

- `src/app/qantas/page.js` is the main calculator UI (client component), owning all form state
  (segments, elite status, trip type). Input state round-trips through query params
  (`utils/segmentInputUrlParser.js`) for deep-linking, hydrated via `useSearchParams`. Recent
  calculations persist client-side via `utils/recentCalculations.js` (localStorage). `_components/`
  holds page-specific pieces (`input.js`, `resultsSummary.js`, `segmentResults.js`,
  `recentCalculations.js`, `footer.js`).
- `src/app/_shared/components/` holds cross-page input widgets: `segmentInput.js` (list/validation,
  `validate()`/`buildAirlineOptions()`), `autocomplete.js`, `advancedInput.js` (bulk entry).
- `src/app/_shared/models/` holds plain data classes (`Segment`, `Route`, `Earnings`, `SegmentInput`)
  — mutable JS classes with a `.clone({...})` pattern for partial updates, not immutable records.
- `src/app/oneworld/` is a separate, less-developed page comparing multiple programs side-by-side;
  `_models/eliteTiers.js` defines per-program elite tier lists/ordering.

### Path aliases and styling

`@/*` maps to `src/*` (see `jsconfig.json`). Styling is MUI (`@mui/material`) + Emotion with Roboto
via `@fontsource/roboto`; `src/theme.js` defines the MUI theme, wired up via `@mui/material-nextjs`
in `src/app/layout.js`.
