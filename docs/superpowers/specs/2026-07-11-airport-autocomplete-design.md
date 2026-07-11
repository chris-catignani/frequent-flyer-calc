# Airport Autocomplete — Design

## Problem

The "From"/"To" airport fields in the segment input UI (`AirportInput` in
`src/app/_shared/components/segmentInput.js`) are plain `TextField`s. Users must know and type the
exact 3-letter IATA code; there's no way to search by city or airport name, and no assistance if you
don't already know the code.

## Goals

- Let users find an airport by typing its IATA code, city, or airport name, and pick it from a
  suggestion list.
- Preserve the existing "just type a 3-letter code and move on" workflow for users who already know
  codes — no forced dropdown interaction.
- No change to the underlying data contract: `SegmentInput.fromAirportText`/`toAirportText` remain
  plain lowercase strings (typically a 3-letter code), exactly as consumed today by URL deep-linking
  (`segmentInputUrlParser.js`), recent-calculation persistence (`recentCalculations.js`), and the bulk
  text/ITA-Matrix importer (`segmentInputParser.js`, `advancedInput.js`). None of those need to change.
- Runs entirely client-side, consistent with the rest of the app (`getAirport()` already runs in the
  browser off the bundled `@nwpr/airport-codes` dataset; there is no airport-lookup API route).

## Non-goals

- No change to how `fromAirport`/`toAirport` get derived from text (still `getAirport()`, called by
  the parent page's `segmentInputChanged`/`setAllSegmentInputs`, still triggered once the text is a
  3-letter code).
- No new component test infrastructure — there is no existing `segmentInput.test.js` or React
  Testing Library component test in this codebase; this change doesn't introduce one.
- No build-time data preprocessing. Considered and rejected — see "Caching" below.

## Design

### 1. Search layer — `searchAirports(query, limit = 25)` in `src/app/_shared/utils/airports.js`

A new exported function alongside the existing `getAirport`/`getAirportsForCity`/
`getAirportsForCountry`/`calcDistance`.

**Caching:** On first call, lazily builds and memoizes (module-level variable) an array of every
airport with a non-empty `iata` (reusing the existing `standardizeAirport` fix-ups), each entry
carrying pre-lowercased `iata`/`city`/`name` alongside the original airport object. This is a pure
runtime optimization: the underlying `@nwpr/airport-codes` list is static for the life of the page, so
normalizing it once (a single pass over ~7,700 records, sub-frame cost) avoids redoing that
normalization on every keystroke across every airport field on the page. It's built lazily (first
search, not on module load / page load) so pages that never touch an airport field never pay the cost.
This is deliberately *not* a build-time codegen step — see rationale below.

**Matching, per search call:**
- Normalize the query: lowercase, trim. Empty/whitespace query → return `[]`.
- Score each cached airport:
  - `iata` exact match → best
  - `iata` prefix match
  - `city` prefix match
  - `name` prefix match
  - `iata` substring match
  - `city` substring match
  - `name` substring match
  - (country is intentionally excluded from matching — a query like "united" or "australia" would
    otherwise surface hundreds of low-relevance results)
- Sort by score, tie-break alphabetically by city.
- Return the top `limit` (25) matches, mapped back to the original airport objects.

This is a pure function (input: string; output: array of airport objects) and is the primary unit of
test coverage for this feature — ranking order, limit enforcement, no-match, and empty-query cases.

### 2. `AirportInput` component (`segmentInput.js`)

Replace the `TextField` with an MUI `Autocomplete` in `freeSolo` mode:

- `inputValue` is the existing `value` prop (still a plain string, e.g. `"syd"`).
- `onInputChange` (reason `"input"`, i.e. actual typing) calls `onChange(text.toLowerCase().trim())`
  on every keystroke — byte-for-byte the same call the current `TextField`'s `onChange` makes today.
  This is what keeps every downstream consumer (fare-class-clearing side effects, calculation-output
  invalidation, `validate()`'s "Invalid IATA" check, URL sync, recent calculations) working unmodified.
- `options` is computed as `searchAirports(value)` (memoized on `value`) — the component never hands
  MUI's `Autocomplete` the full 7,700-airport list, so there's no need to fight or disable its default
  client-side filtering; our list is already filtered/ranked/capped.
- `getOptionLabel(option)` returns the option's plain lowercase `iata` code. This means the field's
  displayed value after a selection is just the code (matching today's convention), and if MUI's
  internals ever compare current input text against `getOptionLabel` output, they're comparing
  code-to-code.
- `renderOption` displays `City (CODE) — Airport Name`, e.g.
  `New York (JFK) — John F Kennedy International Airport`, so cities with multiple airports (JFK/LGA/
  EWR) are distinguishable.
- Selecting a suggestion (`onChange` reason `selectOption`) calls `onChange(option.iata.toLowerCase())`
  directly — same 3-letter-code contract as typing.
- No other props change: `label`, `error`, `helperText` behave as today.

### Data flow (unchanged downstream)

```
AirportInput (keystroke or selection)
  → onChange(lowercaseText)
  → SegmentInput.onChange → segmentInput.clone({ fromAirportText: lowercaseText })
  → page.js segmentInputChanged (existing, untouched)
    → getAirport(text) when text.length === 3 → sets fromAirport
  → validate() (existing, untouched) → "Invalid IATA" if text set but fromAirport unresolved
```

### Error handling

No new error states. The existing "Invalid IATA" validation error still fires the same way: if the
resolved text doesn't match a known airport's `iata`, `getAirport()` returns `undefined` and
`validate()` flags it, exactly as today (this covers both a mistyped free-text code and, in principle,
any edge case in the new search path — the search path never blocks free text from being submitted).

### Testing

- Unit tests for `searchAirports` in `src/app/_shared/utils/airports.test.js` (new file, alongside the
  other `_shared` test files): ranking precedence (exact code > code prefix > city prefix > name
  prefix > substrings), `limit` enforcement, empty/whitespace query, no-match query, and a
  multi-airport-city case (e.g. New York) to confirm all three airports are returned and ranked
  sensibly relative to each other.
- No new component-level test — consistent with the rest of `segmentInput.js`, which has no existing
  component tests.

### Rejected alternative: build-time data preprocessing

Considered generating a pre-lowercased dataset at build time (codegen script writing a generated file,
or a `postinstall`/`prebuild` step) instead of the lazy runtime cache. Rejected: the only thing this
would save is the same one-time, sub-frame (~5-10ms) normalization pass that the lazy cache already
reduces to "once per session, only if an airport field is used" — and it would trade that negligible
saving for real ongoing cost: a generated-file-in-git staleness risk, or a build step that must be
remembered whenever `@nwpr/airport-codes` is upgraded.
