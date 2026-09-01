# Mobile Layout Optimization and Horizontal Scroll Fixes Design

## Overview
This document specifies the design for improving the mobile user experience in the Qantas Points & Status Credits Calculator. The goals are:
1. Eliminate unwanted horizontal scrolling on mobile viewports (down to 320px width).
2. Redesign the segment inputs on mobile so that drag-to-reorder and delete controls are organized into a clean segment header, allowing airport input fields (From / To) to occupy 50% width each without cramped icon buttons.

## Context & Problem Statement
Currently, on mobile viewports (`xs` breakpoint):
1. **Segment Input Controls**: The drag handle and delete 'X' button are positioned within the second row flanking the "From" and "To" airport inputs. This compresses the airport text fields into ~38% width each, creates poor touch targets, and visually decouples the actions from the whole segment.
2. **Horizontal Overflow**:
   - The action button row (`Add Segment`, `Calculate`, `Compare with Qantas Calculator` switch) uses `wrap="nowrap"` within a 50% grid column on mobile, overflowing small screen widths.
   - The top controls row (`Trip Type` and `Elite Status`) overflows on viewports under 375px when side-by-side.
   - The segment results table has 5 columns with desktop cell paddings (16px padding on either side), exceeding standard mobile screen widths.
   - Top-level and footer Grid containers with `spacing` combined with `Container disableGutters` create negative margins that cause subpixel/gutter horizontal scrolling.

## Proposed Design

### 1. Segment Input Item Layout (`src/app/_shared/components/segmentInput.tsx`)

#### Desktop (`sm` and up)
- Retain the existing 22-column single-row layout:
  - Column 1 (1 col): Drag handle button (`DragHandle`)
  - Column 2–7 (6 cols): Airline selector (`AirlineInput`)
  - Column 8–11 (4 cols): Origin airport (`AirportInput`)
  - Column 12–15 (4 cols): Destination airport (`AirportInput`)
  - Column 16–21 (6 cols): Fare class input (`customFareClassInput` or default `TextField`)
  - Column 22 (1 col): Delete button (`RemoveSegmentInputButton`)

#### Mobile (`xs`)
- **Segment Header Bar**:
  - Rendered only on `xs` breakpoint (`display: { xs: "flex", sm: "none" }`).
  - Container: `Box` with `flexDirection: "row"`, `justifyContent: "space-between"`, `alignItems: "center"`, `mb: 1`.
  - Left side: Drag handle (if multiple segments) + Typography label (e.g. `Segment 1`, `Segment 2` in `subtitle2` / `body2` with `color: "text.secondary"`). Touch target is comfortable for drag interactions.
  - Right side: Delete button (`IconButton` with `Clear` icon, `data-testid="segment-delete-{idx}"`). Rendered only if `showDeleteButton` is true.
- **Input Fields Grid**:
  - Responsive column sizing:
    - Airline dropdown: `size={{ xs: 12, sm: 6 }}`
    - `From` airport: `size={{ xs: 6, sm: 4 }}`
    - `To` airport: `size={{ xs: 6, sm: 4 }}`
    - Fare Class input: `size={{ xs: 12, sm: 6 }}`
- **Desktop Actions Row Alignment**:
  - The desktop drag handle and delete button Grid items have `display: { xs: "none", sm: "flex" }`.
- **Dividers**:
  - Retain dividers between segments on mobile to provide clear separation between cards.

### 2. Comprehensive Horizontal Scroll & Overflow Fixes

#### Top Controls (`src/app/qantas/page.tsx`)
- Update the header controls container in `Paper` to handle flex wrapping gracefully on mobile (`flexWrap: "wrap"`, `gap: { xs: 1.5, sm: 0 }`, `justifyContent: { xs: "center", sm: "space-between" }`, `alignItems: "center"`).
- Ensure `EliteStatusInput` maintains appropriate responsive width (`width: { xs: "100%", sm: 175 }` or auto-flex).

#### Bottom Action Buttons (`src/app/qantas/page.tsx`)
- Refactor the action controls row:
  - On desktop (`sm`): 3 columns (`Add Segment` on left, `Calculate` in center, `Compare Switch` on right).
  - On mobile (`xs`): Stacked cleanly:
    - Row 1 (mobile): `Add Segment` button on left, `Compare Switch` on right (with compact font size and padding).
    - Row 2 (mobile): `Calculate` button full width / centered with prominent touch target.

#### Results Table (`src/app/qantas/_components/segmentResults.tsx`)
- Add `size={{ xs: "small", sm: "medium" }}` (or responsive padding `px: { xs: 1, sm: 2 }` on TableCell) to avoid cell padding inflation.
- Ensure `TableContainer` has `sx={{ width: "100%", overflowX: "auto" }}` with `maxWidth: "100%"`.

#### Container & Footer (`src/app/qantas/page.tsx` & `src/app/qantas/_components/footer.tsx`)
- Container / Page wrapper: Set `overflowX: "hidden"` or avoid negative margin overflow from `Grid spacing`.
- Footer: Convert fragmented flex typography nodes into inline text with `<a>` links to allow standard natural word wrapping on mobile.

## Test & Accessibility Compatibility
- All `data-testid` attributes (`segment-row-{idx}`, `segment-delete-{idx}`, `segment-airline-{idx}`, `segment-from-{idx}`, `segment-to-{idx}`, `segment-fare-class-{idx}`, `add-segment-button`, `calculate-button`, `compare-with-qantas-switch`, etc.) remain identical and present.
- All unit tests (`npm test`) and E2E tests (`npm run test:e2e`) will pass without regression.
