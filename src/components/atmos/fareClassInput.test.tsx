import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { atmosSegmentInputAdapter } from "./fareClassInput";
import { createSegmentInput } from "@/models/segmentInput";

describe("atmosSegmentInputAdapter", () => {
  const qr = createSegmentInput("qr", "", "doh", "lhr");

  it("requires a fare class only for chart-based partner flights", () => {
    const required = atmosSegmentInputAdapter.isFareClassRequired!;
    expect(required(qr, { earnMethod: "price", ticketIssuer: "other" })).toBe(true);
    expect(required(qr, { earnMethod: "price", ticketIssuer: "alaska" })).toBe(false);
    expect(required(qr, { earnMethod: "distance" })).toBe(false);
  });

  it("renders a dropdown of the partner's fare classes labelled with cabins", () => {
    render(
      <>
        {atmosSegmentInputAdapter.renderFareClassInput!({
          segmentInputIdx: 0,
          segmentInput: { ...qr, fareClass: "q" },
          onChange: jest.fn(),
        })}
      </>
    );
    expect(screen.getByTestId("segment-fare-class-0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Q (Discount Economy)")).toBeInTheDocument();
  });

  it("falls back to the default input for airlines without a table", () => {
    expect(
      atmosSegmentInputAdapter.renderFareClassInput!({
        segmentInputIdx: 0,
        segmentInput: createSegmentInput("as", "", "sea", "lax"),
        onChange: jest.fn(),
      })
    ).toBeNull();
  });

  it("clears the fare class when the airline changes", () => {
    expect(atmosSegmentInputAdapter.shouldClearFareClassOnAirlineChange!(qr, "ba")).toBe(true);
    expect(atmosSegmentInputAdapter.shouldClearFareClassOnAirlineChange!(qr, "qr")).toBe(false);
  });
});
