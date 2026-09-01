# Design Specification: End-to-End (E2E) Testing with Playwright

## 1. Overview
The goal of this specification is to implement an end-to-end (E2E) testing framework and automated suite for the Qantas Frequent Flyer calculator (GitHub Issue #10).

The E2E suite verifies core calculation workflows, multi-segment manipulation, advanced text itinerary entry, elite status changes, trip-type adjustments, and deep-linking capabilities. The tests interact with UI elements exclusively via resilient `data-testid` selectors and run both locally and in automated GitHub Actions PR workflows via a self-hosted Docker runner (mirroring the architecture used in `hotel-tracker`).

---

## 2. Architecture & Infrastructure

### 2.1 Framework & Packages
- **Package**: `@playwright/test` added as a dev dependency.
- **Config**: `playwright.config.ts` located at the repo root.
- **Test Directory**: `e2e/`.
- **Target Server**: Next.js app running at `http://127.0.0.1:3001` (managed automatically via Playwright's `webServer` block during test execution).
- **Package Scripts**:
  - `test:e2e`: `playwright test --project=chromium`
  - `test:e2e:ui`: `playwright test --ui`
  - `test:e2e:show`: `playwright show-report`

### 2.2 Playwright Configuration (`playwright.config.ts`)
- **Port Isolation**: Runs on port 3001 to prevent conflicts with local development on port 3000.
- **Parallelism**: `fullyParallel: true`.
- **Retries**: 1 retry in CI and local test execution.
- **Reporters**: `list` and `html` (with `open: "never"` in automated environments).
- **Traces & Videos**: `retain-on-failure` locally and `on-first-retry` in CI.
- **Browser Channel**: Project configured for `chromium` (using local Chrome channel on macOS dev machines if CI env var is not set, standard pinned Chromium in CI container).
- **Web Server Config**:
  ```ts
  webServer: {
    command: 'npx next start -p 3001',
    url: 'http://127.0.0.1:3001/qantas',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  }
  ```

---

### 2.3 CI Workflow (`.github/workflows/ci.yml`)
Runs on `pull_request` targeting `main` (ignoring markdown files).
Follows the runner pattern from `hotel-tracker`:
- **Job**: `e2e`
- **Runner**: `runs-on: [self-hosted, docker]`
- **Container**: `mcr.microsoft.com/playwright:v1.58.2-noble`
- **Steps**:
  1. `actions/checkout@v4`
  2. `npm ci`
  3. `npm run build`
  4. `npx playwright test --project=chromium`
  5. `actions/upload-artifact@v4` on failure for report and traces.

---

## 3. UI Instrumentation (`data-testid` Contract) & Test Helpers

To ensure reliable, non-brittle test selectors, components will be instrumented with the following `data-testid` attributes:

### 3.1 Trip & Global Inputs (`src/app/qantas/page.tsx`, `src/app/qantas/_components/input.tsx`)
- `trip-type-toggle`: The `ToggleButtonGroup` container.
- `trip-type-oneway`: "One Way" toggle button.
- `trip-type-return`: "Return" toggle button.
- `elite-status-input`: Elite Status Autocomplete / TextField.
- `add-segment-button`: "Add Segment" Button.
- `calculate-button`: "Calculate" Button.
- `compare-with-qantas-switch`: Compare with Qantas switch toggle.

### 3.2 Segment Row Inputs (`src/app/_shared/components/segmentInput.tsx`)
- `segment-row-{index}`: Container `Grid` for segment input at row `index`.
- `segment-airline-{index}`: Airline autocomplete input for row `index`.
- `segment-from-{index}`: Origin airport autocomplete input for row `index`.
- `segment-to-{index}`: Destination airport autocomplete input for row `index`.
- `segment-fare-class-{index}`: Fare class input/select for row `index`.
- `segment-delete-{index}`: Remove segment button for row `index`.
- `segment-error-airline-{index}`: Helper/error text for airline.
- `segment-error-from-{index}`: Helper/error text for origin airport.
- `segment-error-to-{index}`: Helper/error text for destination airport.
- `segment-error-fare-class-{index}`: Helper/error text for fare class.

### 3.3 Advanced Inputs (`src/app/_shared/components/advancedInput.tsx`)
- `advanced-input-toggle`: Stack header clicking to expand/collapse advanced input.
- `advanced-input-text-accordion`: Free Form Text Itinerary accordion header.
- `advanced-input-text-field`: Textarea `TextField` for free form itinerary string.
- `advanced-input-text-apply-button`: "Apply" button for free form itinerary.
- `advanced-input-ita-accordion`: ITA Matrix JSON accordion header.
- `advanced-input-ita-field`: Textarea `TextField` for ITA Matrix JSON.
- `advanced-input-ita-apply-button`: "Apply" button for ITA Matrix.

### 3.4 Summary & Segment Results (`src/app/qantas/_components/resultsSummary.tsx`, `src/app/qantas/_components/segmentResults.tsx`)
- `results-summary`: Container for calculation summary.
- `total-points-earned`: Typography element displaying total Qantas Points earned.
- `total-status-credits-earned`: Typography element displaying total Status Credits earned.
- `segment-results-table`: Results table container.
- `segment-result-row-{index}`: Table row for segment `index`.
- `segment-result-route-{index}`: Cell displaying route `from - to`.
- `segment-result-points-{index}`: Cell displaying segment Qantas points.
- `segment-result-status-credits-{index}`: Cell displaying segment status credits.

### 3.5 Recent Calculations (`src/app/qantas/_components/recentCalculations.tsx`)
- `recent-calculations-toggle`: Stack header clicking to expand/collapse recent calculations.
- `recent-calculation-chip-{index}`: Chip for recent calculation at `index`.
- `recent-calculations-clear-all`: "Clear All" Chip.

### 3.6 Interaction Helpers (`e2e/helpers.ts`)
To handle MUI's Autocomplete popover portals cleanly without test flakiness:
- `selectAirline(page, index, airlineLabelOrIata)`: Types the airline into `segment-airline-{index}` input and selects the item from the MUI Popper dropdown.
- `setAirport(page, type: 'from' | 'to', index, iata)`: Fills the freeSolo airport input with the 3-letter IATA code.
- `setFareClass(page, index, fareClassOrName)`: Handles both dropdown select (for QF/JQ) and text input (for partner airlines like AA).
- `setEliteStatus(page, status)`: Selects the elite status tier from the Autocomplete dropdown.

---

## 4. Test Scenarios

### 4.1 Simple Route Calculations (`e2e/simple-routes.spec.ts`)
- **Non-Qantas Route**:
  - Input: Airline `AA` (American Airlines), From `LAX`, To `JFK`, Fare Class `F` (First).
  - Action: Click Calculate.
  - Assertions: Total Qantas Points = `3,750`, Status Credits = `150`.
- **Qantas Domestic Route**:
  - Input: Airline `QF` (Qantas), From `SYD`, To `MEL`, Fare Class `Discount Economy` (`E` / `Discount Economy`).
  - Action: Click Calculate.
  - Assertions: Total Qantas Points = `800` (minimum floor applied for Bronze), Status Credits = `10`.

### 4.2 Multi-Segment Manipulation (`e2e/segment-manipulation.spec.ts`)
- **Add, Edit, and Delete Segments**:
  - Fill Segment 0: `QF`, `SYD` $\rightarrow$ `MEL`, `Flexible Economy`.
  - Click "Add Segment".
  - Verify Segment 1 inherits previous destination as origin (`MEL`).
  - Fill Segment 1: `QF`, `MEL` $\rightarrow$ `BNE`, `Flexible Economy`.
  - Calculate $\rightarrow$ verify 2 segment result rows and aggregate totals:
    - Points: `2,575` (`1,200` for SYD-MEL + `1,375` for MEL-BNE)
    - Status Credits: `50` (`20` for SYD-MEL + `30` for MEL-BNE)
  - Delete Segment 0 $\rightarrow$ verify only 1 segment remains (`MEL` $\rightarrow$ `BNE`).
  - Calculate $\rightarrow$ verify updated totals (`1,375` points, `30` status credits).

### 4.3 Advanced Inputs (`e2e/advanced-input.spec.ts`)
- **Free Form Text Itinerary**:
  - Expand Advanced Input.
  - Expand Free Form Text Itinerary.
  - Input text:
    ```text
    qf syd mel y
    qf mel bne y
    ```
  - Click "Apply".
  - Verify form inputs populate with 2 segments (`QF SYD-MEL Y`, `QF MEL-BNE Y`).
  - Click "Calculate".
  - Verify results summary displays:
    - Total Qantas Points: `2,575`
    - Total Status Credits: `50`
    - 2 result rows in the breakdown table with accurate individual earnings.

### 4.4 Controls, Dynamic Recalculation & URL Hydration (`e2e/features.spec.ts`)
- **Trip Type Return Toggle**:
  - Calculate one-way `QF SYD-MEL` in Flexible Economy (Points: `1,200`, SC: `20`).
  - Click "Return" toggle.
  - Verify auto-recalculation triggers with doubled results (Points: `2,400`, SC: `40`) and 2 result rows (`syd - mel`, `mel - syd`).
- **Elite Status Recalculation**:
  - Calculate `QF SYD-MEL` in Flexible Economy with Bronze status (Points: `1,200`).
  - Change Elite Status dropdown to `Platinum` (100% bonus on 750 base points = 1,500).
  - Verify points automatically update to reflect Platinum tier earnings (Points: `1,500`, SC: `20`).
- **Deep-linking & URL Hydration**:
  - Navigate directly to `/qantas?segmentInputs=qf_syd_mel_y&tripType=return&eliteStatus=Gold`.
  - Verify inputs hydrate: Airline `QF`, From `SYD`, To `MEL`, Fare Class `Flexible Economy`, Trip Type `Return`, Elite Status `Gold`.
- **Recent Calculations History**:
  - Perform a calculation.
  - Expand "Recent Calculations".
  - Verify chip is added with route and status summary.
  - Modify inputs, click the recent calculation chip, and verify inputs restore.

---

## 5. Verification Plan

### Automated Verification
1. **Local Playwright Suite**:
   ```bash
   npm run build
   npm run test:e2e
   ```
2. **Existing Unit Tests & Linter**:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```
3. **CI Pipeline Simulation**:
   - Verify all test specs run headlessly and generate clean HTML/list reporter output.
