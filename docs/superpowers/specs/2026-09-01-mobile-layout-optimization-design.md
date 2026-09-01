# Mobile Layout Optimization and Horizontal Scroll Fixes Design

## Overview
This document specifies the design for improving the mobile user experience in the Qantas Points & Status Credits Calculator. The goals are:
1. Eliminate unwanted horizontal scrolling on mobile viewports (down to 320px width).
2. Redesign the segment inputs on mobile so that drag-to-reorder and delete controls form a natural segment header, allowing airport input fields (From / To) to occupy 50% width each without cramped icon buttons.
3. Guarantee DOM element uniqueness (no duplicate `data-testid`s or duplicate `@hello-pangea/dnd` drag handles) across all viewport sizes.

## Context & Problem Statement
Currently, on mobile viewports (`xs` breakpoint):
1. **Segment Input Controls**: The drag handle and delete 'X' button are positioned within the second row flanking the "From" and "To" airport inputs. This compresses the airport text fields into ~38% width each, creates poor touch targets, and visually decouples the actions from the whole segment.
2. **Horizontal Overflow**:
   - The action button row (`Add Segment`, `Calculate`, `Compare with Qantas Calculator` switch) uses `wrap="nowrap"` within a 50% grid column on mobile, overflowing small screen widths.
   - The top controls row (`Trip Type` and `Elite Status`) overflows on viewports under 375px when side-by-side.
   - The segment results table has 5 columns with desktop cell paddings (16px padding on either side), exceeding standard mobile screen widths.
   - Top-level and footer Grid containers with `spacing` combined with `Container disableGutters` create negative margins that cause subpixel/gutter horizontal scrolling.

## Proposed Design & Architecture

### 1. Segment Input Item Layout (`src/app/_shared/components/segmentInput.tsx`)

#### Single-Tree Responsive Grid with `columns={{ xs: 12, sm: 22 }}`
To ensure **zero DOM element duplication** (preventing React Testing Library and Playwright strict mode issues) while achieving the optimal responsive layout, the single `SegmentInputRow` will use responsive grid sizing and ordering:

- **Drag Handle & Segment Label**:
  - `size={{ xs: 8, sm: 1 }}`
  - `order={{ xs: 1, sm: 1 }}`
  - `sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", sm: "center" }, height: { xs: "40px", sm: "56px" } }}`
  - On mobile (`xs`), displays the drag handle followed by `<Typography variant="subtitle2" color="text.secondary">Segment {idx + 1}</Typography>`.
  - On desktop (`sm`), displays only the drag handle centered in its 56px column.
- **Delete Button**:
  - `size={{ xs: 4, sm: 1 }}`
  - `order={{ xs: 2, sm: 6 }}`
  - `sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-end", sm: "center" }, height: { xs: "40px", sm: "56px" } }}`
  - Houses the single `RemoveSegmentInputButton` (`data-testid="segment-delete-{idx}"`).
- **Airline Dropdown**:
  - `size={{ xs: 12, sm: 6 }}`
  - `order={{ xs: 3, sm: 2 }}`
  - Takes 100% width on mobile, 6/22 cols on desktop.
- **From Airport Input**:
  - `size={{ xs: 6, sm: 4 }}`
  - `order={{ xs: 4, sm: 3 }}`
  - Takes 50% width on mobile, 4/22 cols on desktop.
- **To Airport Input**:
  - `size={{ xs: 6, sm: 4 }}`
  - `order={{ xs: 5, sm: 4 }}`
  - Takes 50% width on mobile, 4/22 cols on desktop.
- **Fare Class Input**:
  - `size={{ xs: 12, sm: 6 }}`
  - `order={{ xs: 6, sm: 5 }}`
  - Takes 100% width on mobile, 6/22 cols on desktop.

#### Single-Segment Edge Case
- When `segmentInputs.length === 1` (`showDeleteButton = false`, `enableDrag = false`), the header on mobile displays `"Segment 1"` with no grab icon and no delete button.
- On desktop, the spacing placeholders maintain column alignment.

#### Airport Autocomplete Popper
- Set `slotProps.paper.sx` in `AirportInput` to `{ minWidth: { xs: 240, sm: 280 }, maxWidth: "calc(100vw - 32px)" }` to prevent popper overflow on 320px screens.

---

### 2. Comprehensive Horizontal Scroll & Overflow Fixes

#### Top Controls (`src/app/qantas/page.tsx`)
- Top controls container in `Paper`:
  - `sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: { xs: 2, sm: 0 }, p: 2 }}`.
  - `EliteStatusInput`: `sx={{ width: { xs: "100%", sm: 175 } }}`.

#### Action Buttons Row (`src/app/qantas/page.tsx`)
- Vertical stacking on mobile (`xs`), 3-column layout on desktop (`sm`):
  - `Calculate` button: Full width on mobile, centered 4-column on desktop.
  - `Add Segment` button: Full width on mobile (`xs`), 4-column left on desktop.
  - `CompareWithQantasAPISwitch`: Centered/right-aligned flex container with responsive text sizing and no overflow.

#### Results Table (`src/app/qantas/_components/segmentResults.tsx`)
- Table configuration:
  - `<Table size="small">` on `xs` viewports to reduce cell padding.
  - `<TableContainer sx={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>`.
  - Header text: compact, no text overflow.

#### Page Containers & Margin Bleed (`src/app/qantas/page.tsx` & `src/app/qantas/_components/footer.tsx`)
- Outer container: replace `disableGutters` with `sx={{ px: { xs: 1.5, sm: 2 }, overflowX: "hidden" }}`.
- Remove horizontal margins (`mx`) on top-level Grid containers that induce negative margin scrollbars.
- Footer: Convert fragmented flex Grid items into standard `<Typography>` paragraphs with inline `<a>` / `<Link>` tags for fluid text wrapping.

---

## Verification & Testing Plan
1. **Automated Unit Tests**: `npm test` — verify all unit tests pass with zero duplicate test ID warnings.
2. **Automated E2E Tests**: `npm run test:e2e` — verify segment addition, deletion, recalculation, and comparison switch interactions pass across Chromium viewport sizes.
3. **Viewport Responsiveness**: Verify clean rendering down to 320px (iPhone SE / small mobile) without horizontal scrollbar.
