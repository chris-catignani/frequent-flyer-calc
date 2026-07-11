# Airport Autocomplete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users find an airport in the segment "From"/"To" fields by typing its IATA code, city, or airport name, and pick it from a suggestion list, while preserving the existing "just type a 3-letter code" workflow.

**Architecture:** A pure client-side search function (`searchAirports`) ranks the bundled `@nwpr/airport-codes` dataset against a typed query using a lazily-built, memoized lowercase index. `AirportInput` (in `segmentInput.js`) swaps its plain `TextField` for an MUI `Autocomplete` in `freeSolo` mode that calls `searchAirports` for its option list, while every keystroke still flows through the exact same `onChange(text)` contract the rest of the app already depends on.

**Tech Stack:** Next.js (App Router), React 19, MUI v7 (`@mui/material` `Autocomplete`), Jest.

## Global Constraints

- `SegmentInput.fromAirportText`/`toAirportText` must remain plain lowercase strings (typically a 3-letter IATA code) — no change to this data contract, since `segmentInputUrlParser.js`, `recentCalculations.js`, and `segmentInputParser.js` all read/write it directly.
- Search runs entirely client-side; no new API route.
- No build-time data preprocessing — use a lazily-built, module-level memoized cache (rejected alternative, see spec).
- Country is excluded from search matching (spec: too noisy for broad country-name queries).
- Default/cap suggestion count: `limit = 25`.
- No new React component test infrastructure — this repo has no existing component tests for `segmentInput.js`; verify the UI change manually via the dev server instead.
- Spec: `docs/superpowers/specs/2026-07-11-airport-autocomplete-design.md`

---

### Task 1: `searchAirports` search layer

**Files:**
- Modify: `src/app/_shared/utils/airports.js`
- Test: `src/app/_shared/utils/airports.test.js` (new file)

**Interfaces:**
- Produces: `searchAirports(query, limit = 25)` — exported function. Takes a string query and optional limit, returns an array of airport objects (same shape as `getAirport()`'s return value: `{ iata, name, city, country, ... }`), ranked best-match-first, capped at `limit`. Returns `[]` for an empty/whitespace query or no matches.

- [ ] **Step 1: Write the failing tests**

Create `src/app/_shared/utils/airports.test.js`:

```js
import { searchAirports } from './airports';

describe('searchAirports', () => {
  test('returns empty array for an empty query', () => {
    expect(searchAirports('')).toEqual([]);
  });

  test('returns empty array for a whitespace-only query', () => {
    expect(searchAirports('   ')).toEqual([]);
  });

  test('returns empty array when nothing matches', () => {
    expect(searchAirports('zzzzzzz')).toEqual([]);
  });

  test('ranks an exact IATA code match first, ahead of city-name matches for other airports', () => {
    const results = searchAirports('syd', 3);
    expect(results[0].iata).toBe('SYD');
    expect(results[0].city).toBe('Sydney');
  });

  test('matches are case-insensitive', () => {
    const results = searchAirports('SYD', 3);
    expect(results[0].iata).toBe('SYD');
  });

  test('ranks a city-prefix match ahead of a name-substring-only match', () => {
    const results = searchAirports('lon', 100);
    const lhrIndex = results.findIndex((airport) => airport.iata === 'LHR');
    const yazIndex = results.findIndex((airport) => airport.iata === 'YAZ');
    expect(lhrIndex).toBeGreaterThanOrEqual(0);
    expect(yazIndex).toBeGreaterThanOrEqual(0);
    expect(lhrIndex).toBeLessThan(yazIndex);
  });

  test('returns multiple airports for a city with more than one airport', () => {
    const results = searchAirports('new york', 10);
    const iatas = results.map((airport) => airport.iata);
    expect(iatas).toEqual(expect.arrayContaining(['JFK', 'LGA']));
  });

  test('enforces an explicit limit', () => {
    const results = searchAirports('a', 5);
    expect(results.length).toBe(5);
  });

  test('defaults to a limit of 25 when none is given', () => {
    const results = searchAirports('a');
    expect(results.length).toBe(25);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/app/_shared/utils/airports.test.js`
Expected: FAIL — `searchAirports` is not exported / is not a function.

- [ ] **Step 3: Implement `searchAirports`**

In `src/app/_shared/utils/airports.js`, add a module-level cache variable right after the existing `airportFixes` constant (line 8):

```js
const airportFixes = {
  city: {
    'Dallas-Fort Worth': 'Dallas',
  },
};

let _searchIndex = null;
```

Then add the following after the existing `calcDistance` function, at the end of the file:

```js
const buildSearchIndex = () => {
  return airports
    .filter((airport) => airport.iata)
    .map((airport) => {
      standardizeAirport(airport);
      return {
        airport,
        iataLower: airport.iata.toLowerCase(),
        cityLower: airport.city.toLowerCase(),
        nameLower: airport.name.toLowerCase(),
      };
    });
};

const SCORE_EXACT_IATA = 0;
const SCORE_IATA_PREFIX = 1;
const SCORE_CITY_PREFIX = 2;
const SCORE_NAME_PREFIX = 3;
const SCORE_IATA_SUBSTRING = 4;
const SCORE_CITY_SUBSTRING = 5;
const SCORE_NAME_SUBSTRING = 6;

const scoreEntry = (entry, query) => {
  if (entry.iataLower === query) return SCORE_EXACT_IATA;
  if (entry.iataLower.startsWith(query)) return SCORE_IATA_PREFIX;
  if (entry.cityLower.startsWith(query)) return SCORE_CITY_PREFIX;
  if (entry.nameLower.startsWith(query)) return SCORE_NAME_PREFIX;
  if (entry.iataLower.includes(query)) return SCORE_IATA_SUBSTRING;
  if (entry.cityLower.includes(query)) return SCORE_CITY_SUBSTRING;
  if (entry.nameLower.includes(query)) return SCORE_NAME_SUBSTRING;
  return null;
};

export const searchAirports = (query, limit = 25) => {
  const normalizedQuery = query?.toLowerCase().trim();
  if (!normalizedQuery) {
    return [];
  }

  if (!_searchIndex) {
    _searchIndex = buildSearchIndex();
  }

  const matches = [];
  for (const entry of _searchIndex) {
    const score = scoreEntry(entry, normalizedQuery);
    if (score !== null) {
      matches.push({ entry, score });
    }
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.entry.cityLower.localeCompare(b.entry.cityLower);
  });

  return matches.slice(0, limit).map((match) => match.entry.airport);
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/app/_shared/utils/airports.test.js`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/_shared/utils/airports.js src/app/_shared/utils/airports.test.js
git commit -m "$(cat <<'EOF'
Add searchAirports for airport code/city/name lookup

Enables searching the bundled airport dataset by IATA code, city, or
airport name with a lazily-cached, ranked match list.
EOF
)"
```

---

### Task 2: Wire `AirportInput` up to `searchAirports`

**Files:**
- Modify: `src/app/_shared/components/segmentInput.js:357-370` (the `AirportInput` component)

**Interfaces:**
- Consumes: `searchAirports(query, limit)` from Task 1 (`src/app/_shared/utils/airports.js`), returning airport objects with `{ iata, name, city, ... }`.
- No change to `AirportInput`'s own props (`label`, `value`, `error`, `onChange`) or to how its parent (`SegmentInput` in this same file) calls it — the parent code at lines 187-230 is untouched.

- [ ] **Step 1: Update imports**

At the top of `src/app/_shared/components/segmentInput.js`, add:

```js
import { useMemo } from 'react';
```

and:

```js
import { searchAirports } from '../utils/airports';
```

(Add the `react` import as a new top-level import line; add the `searchAirports` import alongside the existing `../models/...`/`./autocomplete` relative imports.)

- [ ] **Step 2: Replace the `AirportInput` implementation**

Replace the existing `AirportInput` component (currently a plain `TextField`, around line 357):

```js
const AirportInput = ({ label, value, error, onChange }) => {
  return (
    <TextField
      label={label}
      value={value}
      error={error}
      helperText={error ? error : ' '}
      sx={{ width: '100%' }}
      onChange={(event) => {
        onChange(event.target.value?.toLowerCase()?.trim());
      }}
    />
  );
};
```

with:

```js
const AirportInput = ({ label, value, error, onChange }) => {
  const options = useMemo(() => searchAirports(value), [value]);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      autoHighlight
      options={options}
      filterOptions={(presetOptions) => presetOptions}
      inputValue={value || ''}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'input') {
          onChange(newInputValue.toLowerCase().trim());
        }
      }}
      onChange={(event, newValue) => {
        if (newValue && typeof newValue === 'object') {
          onChange(newValue.iata.toLowerCase());
        }
      }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.iata.toLowerCase())}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.city} ({option.iata.toUpperCase()}) — {option.name}
          </li>
        );
      }}
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={error ? error : ' '} />
      )}
    />
  );
};
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — no existing test broken (in particular `segmentInput.js` has no component tests, so this just confirms Task 1's tests and everything else still pass).

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/qantas`.

Verify all of the following, then stop the dev server (Ctrl+C):

1. In the "From" field, type `syd` — a dropdown appears; the top suggestion is `Sydney (SYD) — Sydney Kingsford Smith International Airport`.
2. Click that suggestion — the field's text becomes `syd`, and the "Fare Class" field's options update (proving `fromAirport` resolved correctly downstream, unchanged from today's behavior).
3. Clear the "From" field and type `new york` — suggestions for multiple New York airports (e.g. `JFK`, `LGA`) appear.
4. Clear the field entirely, leave both airport fields blank, click "Calculate" — the "Required" validation error still appears (unchanged behavior).
5. Type `zzz` into the "From" field (no selection) and click "Calculate" — the "Invalid IATA" validation error still appears (unchanged behavior, proving free-typed unmatched text still flows through untouched).
6. Type `mel` into the "From" field and tab away without clicking a suggestion — the field keeps the plain typed text `mel` (proving the free-text/no-forced-selection workflow from the spec still works).

- [ ] **Step 6: Commit**

```bash
git add src/app/_shared/components/segmentInput.js
git commit -m "$(cat <<'EOF'
Add autocomplete suggestions to airport input fields

AirportInput now suggests airports by IATA code, city, or name as you
type, while still accepting a typed 3-letter code directly with no
forced selection.
EOF
)"
```
