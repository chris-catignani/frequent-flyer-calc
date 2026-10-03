import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SegmentedToggle, TRIP_TYPE_OPTIONS } from "./segmentedToggle";

describe("SegmentedToggle", () => {
  it("marks the selected option and reports clicks", () => {
    const onChange = jest.fn();
    render(
      <SegmentedToggle
        testId="trip-type-toggle"
        ariaLabel="Trip type selection"
        options={TRIP_TYPE_OPTIONS}
        value="one way"
        onChange={onChange}
      />
    );
    expect(screen.getByTestId("trip-type-oneway")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByTestId("trip-type-return"));
    expect(onChange).toHaveBeenCalledWith("return");
  });

  it("derives test ids from a prefix when options have none", () => {
    render(
      <SegmentedToggle
        ariaLabel="Earning method"
        testIdPrefix="earn-method"
        options={[
          { value: "distance", label: "Distance" },
          { value: "price", label: "Price" },
        ]}
        value="price"
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("earn-method-price")).toHaveAttribute("aria-pressed", "true");
  });
});
