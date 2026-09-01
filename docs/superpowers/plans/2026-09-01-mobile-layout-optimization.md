# Mobile Layout Optimization and Horizontal Scroll Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize mobile UI across the calculator, fix horizontal scrolling on viewports down to 320px, and improve segment drag/delete controls on mobile with 50%/50% width for airport fields.

**Architecture:** Use a single responsive Grid with `columns={{ xs: 12, sm: 22 }}` in `segmentInput.tsx` to display a clean header on mobile and a single row on desktop without duplicating DOM elements or test IDs. Refactor mobile action buttons, top controls, results table, and footer text flow to prevent overflow on mobile.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Material UI (MUI v5/v6), Emotion, `@hello-pangea/dnd`, Jest, Playwright.

## Global Constraints
- Preserve all existing `data-testid` attributes (`segment-row-{idx}`, `segment-delete-{idx}`, `segment-airline-{idx}`, `segment-from-{idx}`, `segment-to-{idx}`, `segment-fare-class-{idx}`, `add-segment-button`, `calculate-button`, `compare-with-qantas-switch`, `trip-type-toggle`, `elite-status-input`, `segment-results-table`, etc.).
- Maintain zero DOM element duplication for interactive controls to prevent test runner and Playwright strict mode failures.
- Ensure viewport responsiveness down to 320px width without horizontal scrollbars.

---

### Task 1: Redesign Segment Input Row for Mobile and Desktop with Single DOM Tree

**Files:**
- Modify: `src/app/_shared/components/segmentInput.tsx`
- Modify: `src/app/_shared/components/segmentInput.test.tsx`

**Interfaces:**
- Consumes: `SegmentInput`, `SegmentInputAdapter`, `AirlineOption`, `AirportInput`, `AirlineInput`
- Produces: `SegmentInputList`, `SegmentInputListItem`, `SegmentInputRow`

- [ ] **Step 1: Write test in `segmentInput.test.tsx` verifying mobile segment header and input rendering**

```tsx
it("renders single delete button and segment row with correct responsive test IDs", () => {
  render(
    <SegmentInputList
      segmentInputs={[defaultSegment, defaultSegment.clone({ uuid: "test-uuid-2" })]}
      errors={{}}
      airlineOptions={airlineOptions}
      onDeleteSegmentPressed={jest.fn()}
      onSegmentInputChanged={jest.fn()}
      onSegmentsReordered={jest.fn()}
    />
  );

  const deleteButtons0 = screen.getAllByTestId("segment-delete-0");
  expect(deleteButtons0).toHaveLength(1);
  const deleteButtons1 = screen.getAllByTestId("segment-delete-1");
  expect(deleteButtons1).toHaveLength(1);
  expect(screen.getByText("Segment 1")).toBeInTheDocument();
  expect(screen.getByText("Segment 2")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run unit test to verify failure**

Run: `npx jest src/app/_shared/components/segmentInput.test.tsx -t "renders single delete button"`
Expected: FAIL (text "Segment 1" not found)

- [ ] **Step 3: Update `SegmentInputRow` in `src/app/_shared/components/segmentInput.tsx`**

Update `SegmentInputRow`:
1. Use `columns={{ xs: 12, sm: 22 }}` and `spacing={1}`.
2. Render Drag Handle + "Segment {idx + 1}" label on mobile (`size={{ xs: 8, sm: 1 }}`, `order={{ xs: 1, sm: 1 }}`).
3. Render Delete Button on mobile header right / desktop right (`size={{ xs: 4, sm: 1 }}`, `order={{ xs: 2, sm: 6 }}`).
4. Airline Input: `size={{ xs: 12, sm: 6 }}`, `order={{ xs: 3, sm: 2 }}`.
5. From Airport Input: `size={{ xs: 6, sm: 4 }}`, `order={{ xs: 4, sm: 3 }}`.
6. To Airport Input: `size={{ xs: 6, sm: 4 }}`, `order={{ xs: 5, sm: 4 }}`.
7. Fare Class Input: `size={{ xs: 12, sm: 6 }}`, `order={{ xs: 6, sm: 5 }}`.
8. Set `AirportInput` popper paper max width: `maxWidth: "calc(100vw - 32px)"`.

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `npx jest src/app/_shared/components/segmentInput.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/_shared/components/segmentInput.tsx src/app/_shared/components/segmentInput.test.tsx
git commit -m "feat(ui): redesign segment input row for responsive mobile layout"
```

---

### Task 2: Fix Top Controls, Action Buttons Stack, and Outer Padding in Calculator Page

**Files:**
- Modify: `src/app/qantas/page.tsx`

**Interfaces:**
- Consumes: `useCalculator`, `SegmentInputList`, `EliteStatusInput`, `RecentCalculationSelection`, `AdvancedInput`, `ResultsSummary`, `SegmentResults`
- Produces: `Qantas` page component

- [ ] **Step 1: Update container padding and layout in `src/app/qantas/page.tsx`**

1. Replace `disableGutters` on `<Container>` with responsive horizontal padding `sx={{ px: { xs: 1.5, sm: 2 } }}`.
2. Remove negative margin grid conflicts (`mx={{ xs: 0, sm: 2 }}` removed from top Grid container, width set to `100%`).
3. Refactor the `Paper` header controls:
   - Use `display: "flex"`, `flexDirection: { xs: "column", sm: "row" }`, `justifyContent: "space-between"`, `alignItems: { xs: "stretch", sm: "center" }`, `gap: { xs: 2, sm: 0 }`.
   - Update `EliteStatusInput` (`src/app/qantas/_components/input.tsx`) or its wrapper to take full width on mobile (`width: { xs: "100%", sm: 175 }`).

- [ ] **Step 2: Update action buttons layout in `src/app/qantas/page.tsx`**

1. Refactor the action buttons row to be clean and non-overflowing on mobile:
   - On desktop (`sm`): 3 columns (`Add Segment` on left, `Calculate` centered, `Compare Switch` on right).
   - On mobile (`xs`): Stacked controls with `Calculate` button at the top/center full width, `Add Segment` and `Compare Switch` spaced cleanly without horizontal overflow.
2. In `CompareWithQantasAPISwitch`, optimize typography styling on mobile to prevent text overflow.

- [ ] **Step 3: Run all unit tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add src/app/qantas/page.tsx src/app/qantas/_components/input.tsx
git commit -m "feat(ui): optimize page layout, action buttons, and top controls on mobile"
```

---

### Task 3: Optimize Segment Results Table for Mobile Viewports

**Files:**
- Modify: `src/app/qantas/_components/segmentResults.tsx`

**Interfaces:**
- Consumes: `CalculationResult`, `SegmentResult`
- Produces: `SegmentResults`, `SegmentTableHeader`, `SegmentTableRow`

- [ ] **Step 1: Update TableContainer and Table in `src/app/qantas/_components/segmentResults.tsx`**

1. Add `size="small"` to `<Table>` on mobile (`size={{ xs: "small", sm: "medium" }}` or responsive padding on `TableCell`s: `px: { xs: 1, sm: 2 }`).
2. Add `sx={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}` to `TableContainer`.
3. Add `sx={{ wordBreak: "break-word" }}` for expanded row links and text to prevent wide content overflow.

- [ ] **Step 2: Run unit tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/app/qantas/_components/segmentResults.tsx
git commit -m "feat(ui): make segment results table compact and responsive on mobile"
```

---

### Task 4: Fix Footer Inline Text and Word Wrapping

**Files:**
- Modify: `src/app/qantas/_components/footer.tsx`

**Interfaces:**
- Produces: `Footer`

- [ ] **Step 1: Refactor `Footer` component in `src/app/qantas/_components/footer.tsx`**

1. Replace fragmented `<Grid container>` text chunks with semantic `<Box>` and `<Typography>` paragraphs.
2. Use inline `<a>` or MUI `<Link>` tags with appropriate spacing so text wraps naturally across mobile widths down to 320px.

- [ ] **Step 2: Run unit tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit changes**

```bash
git add src/app/qantas/_components/footer.tsx
git commit -m "fix(ui): refactor footer text into inline elements to prevent mobile overflow"
```

---

### Task 5: End-to-End & Responsiveness Verification

**Files:**
- Verify: `e2e/segment-manipulation.spec.ts`
- Verify: `e2e/features.spec.ts`
- Verify: `e2e/advanced-input.spec.ts`

- [ ] **Step 1: Run typecheck and linter**

Run: `npm run typecheck && npm run lint`
Expected: 0 errors

- [ ] **Step 2: Run all unit tests**

Run: `npm test`
Expected: All test suites pass

- [ ] **Step 3: Run Playwright E2E tests**

Run: `npm run test:e2e`
Expected: All E2E tests pass
