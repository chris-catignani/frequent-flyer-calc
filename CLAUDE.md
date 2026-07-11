# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js (App Router) app that calculates frequent flyer points/status credit earnings for a given
flight itinerary, primarily for the Qantas Frequent Flyer program (with partial support for Finnair
and Malaysia Airlines programs). Live routes are `/qantas` (the main, actively developed calculator)
and `/oneworld` (an in-progress multi-program comparison tool — still seeded with hardcoded test data,
see the `TODO` in `src/app/oneworld/page.js`). `/` redirects to `/qantas`.

## Commands

- `npm run dev` — start dev server (Turbopack) at localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint (`next/core-web-vitals`, `next/typescript`, prettier integration)
- `npm run format` — Prettier write across `src/**/*.{js,jsx,ts,tsx,css,html}`
- `npm test` — Jest (jsdom environment, via `next/jest`)
- Single test file: `npx jest path/to/file.test.js`
- Single test by name: `npx jest -t "test name"`

There is no CI config in this repo — lint/test/build are run manually.

## Architecture

### Calculation pipeline

`Calculator.calculate(program, segments, eliteStatus, priceLessTaxes)`
(`src/app/_shared/calculators/calculator.js`) dispatches to one of three per-program calculators
(`finnair`, `malaysia`, `qantas`, each with their own `calculator.js`). Every calculator takes an
array of `Segment` (one flight leg: airline, fare class, from/to airport) and returns:

```
{ segmentResults: [...], containsErrors, elitePoints, airlinePoints }
```

Each program calculator independently declares which airline codes it supports and throws/records a
per-segment error for unsupported airlines rather than failing the whole calculation.

### Qantas calculator (the core of the app)

`src/app/_shared/calculators/qantas/calculator.js` is the most developed calculator and the one worth
understanding in depth. For each segment it:

1. Determines a **fare earn category** (e.g. `discountEconomy`, `flexibleBusiness`) by mapping the
   segment's raw fare class letter through `qantasEarnCategories.js` (for `qf`/`jq`/`gk`, i.e. the
   Qantas Group) or `partnerEarnCategories.js` (for oneworld/other partner airlines). This mapping
   itself is driven by data tables copy-pasted from the Qantas website and parsed by
   `buildFareBuckets` in `earnCategories.js`.
2. Finds the first matching **rule** for that airline from `qantasRules.js` or `partnerRules.js` (maps
   of `airlineCode -> Rule[]`) by calling `rule.applies(segment, fareEarnCategory)` in order, then
   calls `rule.calculate(...)` on the match.
3. Applies elite-status earning bonuses (for `aa`, `qf`, `jq`, `gk` only) and enforces per-fare-class
   minimum points floors (Qantas Group only).

Rules are built from base classes in `rules.js`:
- `DistanceRule` — earnings by great-circle distance band (see `calcDistance` in `utils/airports.js`)
- `IntraCountryRule` — a `DistanceRule` scoped to both airports being in the same country
- `GeographicalRule` — earnings keyed by origin/destination expressed as city, country, or named
  region (see `regions.js`), checked in both directions (A→B or B→A)
- `FareClassRule` — flat earnings per fare class, no geography

Each program's `*Rules.js` file is a big hand-authored list of `build*Rule()` factories, each pasting
in Qantas's published earn-rate tables via `parseEarningRates`/`parsePartnerEarningRates` (whitespace-
delimited strings of points-per-fare-class, parsed positionally against a fixed fare class ordering
like `QANTAS_FARE_CLASSES`). Rules are evaluated in declaration order per airline, with a
distance-banded fallback rule last — so when adding/editing a rule, order relative to other rules for
that airline matters. `rules.test.js`, `qantasEarnCategories.test.js`, `partnerEarnCategories.test.js`
and `calculator.test.js` are the tests to run/extend when touching this logic; `testUtils.js`
(`buildSegment`, `buildSegmentFromString`) is the standard way to construct test segments.

There's also an optional live comparison mode (`compareWithQantasCalc`): when enabled, the app calls
`/api/qantas` (`src/app/api/qantas/route.js`), a thin server-side proxy to Qantas's own public
`earnquote` API, so results can be diffed against Qantas's own calculator in the UI. The README notes
known routes where this app's calc and Qantas's own calc diverge.

Airline groupings/constants live in `_shared/models/constants.js` (alliance-level: `ONEWORLD_AIRLINES`,
`SKYTEAM_AIRLINES`, etc.) and `_shared/models/qantasConstants.js` (Qantas-program-specific: fare class
tables per sub-fleet, `JAL_AIRLINES`, `JETSTAR_AIRLINES`, `PARTNER_AIRLINES`, region display names).

### Page/component structure

- `src/app/qantas/page.js` is the main calculator UI (client component). It owns all form state
  (segments, elite status, trip type), and:
  - Round-trip URL sync: input state is serialized to query params
    (`utils/segmentInputUrlParser.js`) so calculations are deep-linkable/shareable, and hydrated back
    on load via `useSearchParams`.
  - Recent calculations are persisted client-side via `utils/recentCalculations.js` (localStorage).
  - `_components/` holds page-specific pieces (`input.js` elite status selector, `resultsSummary.js`,
    `segmentResults.js`, `recentCalculations.js`, `footer.js`).
- `src/app/_shared/components/` holds cross-page input widgets: `segmentInput.js` (the segment
  list/validation, includes `validate()` and `buildAirlineOptions()` used by page.js),
  `autocomplete.js`, `advancedInput.js` (bulk/raw itinerary entry).
- `src/app/_shared/models/` holds plain data classes (`Segment`, `Route`, `Earnings`,
  `SegmentInput`) — note these are mutable JS classes with a `.clone({...})` pattern for partial
  updates, not immutable records.
- `src/app/oneworld/` is a separate, less-developed page comparing multiple programs side-by-side for
  the same route(s); `_models/eliteTiers.js` defines per-program elite tier lists/ordering.

### Path aliases

`@/*` maps to `src/*` (see `jsconfig.json`). Usage is inconsistent in the codebase — some files under
`_shared` use relative imports (`../../models/...`), others (mainly page-level files) use `@/app/...`.

### Styling

MUI (`@mui/material`) + Emotion, with Roboto via `@fontsource/roboto`. `src/theme.js` defines the MUI
theme, wired up via `@mui/material-nextjs` in `src/app/layout.js`.
