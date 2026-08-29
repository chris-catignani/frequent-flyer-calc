# Design Specification: Business Metrics & Telemetry Tracking

## 1. Overview
The goal of this feature is to capture essential usage metrics and business events to understand user engagement and detect discrepancies between our calculation engine and Qantas's live `earnquote` API.

The project uses `@vercel/analytics` (v1.6.1), which is already active in `RootLayout`. Standard pageviews, visitor counts, and referrers are tracked automatically by Vercel Web Analytics. This specification defines custom event tracking for:
1. **Calculation Executed (`calculation_completed`)**: Tracks itineraries calculated by users, including origin/destination airports, airlines, trip type, elite status, total points, and total status credits.
2. **Qantas API Mismatch (`qantas_api_mismatch`)**: Tracks discrepancies when a user compares our calculation against the live Qantas API and the points or status credits differ.

---

## 2. Architecture & Modules

### 2.1 Centralized Analytics Helper: `src/app/_shared/utils/analytics.js`

To maintain a clean separation of concerns and ensure safe execution, all custom event tracking is centralized in a dedicated utility module.

#### Helper Functions:
1. `trackCalculationCompleted({ segments, tripType, eliteStatus, compareWithQantas, calculationResult })`
   - Extracts and formats:
     - `route`: String of airport pairs (e.g. `"SYD-MEL"` or `"SYD-LAX, LAX-JFK"`).
     - `airports`: Comma-separated unique airport IATA codes (e.g. `"SYD, MEL, LAX, JFK"`).
     - `airlines`: Comma-separated airline codes (e.g. `"QF, AA"`).
     - `trip_type`: `"one way"` | `"return"`.
     - `elite_status`: `"Bronze"` | `"Silver"` | `"Gold"` | `"Platinum"` | `"Platinum One"`.
     - `segment_count`: Total number of flight segments calculated.
     - `total_points`: Total airline points earned.
     - `total_status_credits`: Total status credits earned.
     - `compare_with_qantas`: Boolean indicating whether live Qantas API comparison was enabled.
     - `contains_errors`: Boolean indicating whether any calculation error occurred.
   - Dispatches `track('calculation_completed', properties)` via `@vercel/analytics`.

2. `trackQantasApiMismatch({ segment, ourPoints, ourStatusCredits, qantasPoints, qantasStatusCredits, eliteStatus, tripType })`
   - Formats:
     - `route`: Route string for this segment (e.g. `"PVG-SZX"`).
     - `airline`: Airline code (e.g. `"CA"`).
     - `fare_class`: Fare class letter (e.g. `"Y"`).
     - `elite_status`: Elite status tier.
     - `trip_type`: `"one way"` | `"return"`.
     - `our_points`: Points calculated by our engine.
     - `our_status_credits`: Status credits calculated by our engine.
     - `qantas_points`: Points returned by Qantas API.
     - `qantas_status_credits`: Status credits returned by Qantas API.
   - Dispatches `track('qantas_api_mismatch', properties)` via `@vercel/analytics`.

3. **Defensive Error Handling**:
   - All `track` calls are wrapped in `try...catch` blocks to prevent analytics failures from crashing calculations or UI rendering.

---

## 3. Integration Points

### 3.1 Page Integration: `src/app/qantas/page.js`

In `doCalculation`:
1. Run calculation via `calculate(...)`.
2. Call `trackCalculationCompleted(...)` passing the calculated results and input state.
3. If `theCompareWithQantasCalc` is `true`:
   - Inspect each `segmentResult` in `calculationResult.segmentResults`.
   - If `segmentResult.qantasAPIResults?.qantasData` exists without error:
     - If `segmentResult.airlinePoints !== qantasData.airlinePoints || segmentResult.elitePoints !== qantasData.elitePoints`:
       - Dispatch `trackQantasApiMismatch(...)` for that specific segment.

---

## 4. Verification & Testing Plan

### 4.1 Unit Tests: `src/app/_shared/utils/analytics.test.js`
- Test `trackCalculationCompleted`:
  - Verify property formatting for single-segment one-way itineraries.
  - Verify property formatting for multi-segment return itineraries.
  - Verify error handling and fallback values when fields are missing or empty.
- Test `trackQantasApiMismatch`:
  - Verify mismatch payload generation when points or status credits differ.
  - Verify no event is dispatched when results match.
- Mock `@vercel/analytics`'s `track` method in tests using Jest.

### 4.2 Integration Verification
- Run test suite: `npm test`.
- Run linter: `npm run lint`.
- Verify in development mode that `track` calls log without runtime errors.
