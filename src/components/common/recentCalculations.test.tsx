import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecentCalculationSelection, RecentCalculations } from "./recentCalculations";
import { createSegmentInput } from "@/models/segmentInput";
import type { SavedCalculation } from "@/utils/recentCalculations";

describe("RecentCalculationSelection & RecentCalculations", () => {
  const mockRecentCalculations: SavedCalculation[] = [
    {
      eliteStatus: "Gold",
      tripType: "one way",
      segmentInputs: [
        createSegmentInput({
          airline: "qf",
          fromAirportText: "syd",
          toAirportText: "mel",
          fareClass: "y",
        }),
      ],
    },
    {
      eliteStatus: "Platinum",
      tripType: "return",
      segmentInputs: [
        createSegmentInput({
          airline: "qf",
          fromAirportText: "syd",
          toAirportText: "bne",
          fareClass: "j",
        }),
        createSegmentInput({
          airline: "qf",
          fromAirportText: "bne",
          toAirportText: "syd",
          fareClass: "j",
        }),
      ],
    },
  ];

  it("renders closed initially and expands on toggle click", () => {
    const onRecentCalculationClick = jest.fn();
    const onRecentCalculationDeleteClick = jest.fn();
    const onClearAllClick = jest.fn();

    render(
      <RecentCalculationSelection
        recentCalculations={mockRecentCalculations}
        onRecentCalculationClick={onRecentCalculationClick}
        onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
        onClearAllClick={onClearAllClick}
      />
    );

    const toggle = screen.getByTestId("recent-calculations-toggle");
    expect(toggle).toBeInTheDocument();
    expect(screen.queryByTestId("recent-calculation-chip-0")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByTestId("recent-calculation-chip-0")).toBeInTheDocument();
    expect(screen.getByTestId("recent-calculation-chip-1")).toBeInTheDocument();
    expect(screen.getByTestId("recent-calculations-clear-all")).toBeInTheDocument();
  });

  it("calls onRecentCalculationClick when a chip is clicked", () => {
    const onRecentCalculationClick = jest.fn();
    const onRecentCalculationDeleteClick = jest.fn();
    const onClearAllClick = jest.fn();

    render(
      <RecentCalculations
        recentCalculations={mockRecentCalculations}
        onRecentCalculationClick={onRecentCalculationClick}
        onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
        onClearAllClick={onClearAllClick}
      />
    );

    const chip0 = screen.getByTestId("recent-calculation-chip-0");
    expect(chip0).toHaveTextContent("o/w Gold syd-mel");

    fireEvent.click(chip0);
    expect(onRecentCalculationClick).toHaveBeenCalledTimes(1);
    expect(onRecentCalculationClick).toHaveBeenCalledWith(0);
    expect(onRecentCalculationDeleteClick).not.toHaveBeenCalled();
  });

  it("calls onRecentCalculationClick on Enter keydown", () => {
    const onRecentCalculationClick = jest.fn();
    const onRecentCalculationDeleteClick = jest.fn();
    const onClearAllClick = jest.fn();

    render(
      <RecentCalculations
        recentCalculations={mockRecentCalculations}
        onRecentCalculationClick={onRecentCalculationClick}
        onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
        onClearAllClick={onClearAllClick}
      />
    );

    const chip1 = screen.getByTestId("recent-calculation-chip-1");
    expect(chip1).toHaveTextContent("r/t Platinum syd-bne-syd");

    fireEvent.keyDown(chip1, { key: "Enter" });
    expect(onRecentCalculationClick).toHaveBeenCalledWith(1);
  });

  it("calls onRecentCalculationDeleteClick without calling onRecentCalculationClick when delete button clicked", () => {
    const onRecentCalculationClick = jest.fn();
    const onRecentCalculationDeleteClick = jest.fn();
    const onClearAllClick = jest.fn();

    render(
      <RecentCalculations
        recentCalculations={mockRecentCalculations}
        onRecentCalculationClick={onRecentCalculationClick}
        onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
        onClearAllClick={onClearAllClick}
      />
    );

    const deleteBtn = screen.getByLabelText(/Delete recent calculation o\/w Gold syd-mel/i);
    fireEvent.click(deleteBtn);

    expect(onRecentCalculationDeleteClick).toHaveBeenCalledTimes(1);
    expect(onRecentCalculationDeleteClick).toHaveBeenCalledWith(0);
    expect(onRecentCalculationClick).not.toHaveBeenCalled();
  });

  it("calls onClearAllClick when Clear All is clicked", () => {
    const onRecentCalculationClick = jest.fn();
    const onRecentCalculationDeleteClick = jest.fn();
    const onClearAllClick = jest.fn();

    render(
      <RecentCalculations
        recentCalculations={mockRecentCalculations}
        onRecentCalculationClick={onRecentCalculationClick}
        onRecentCalculationDeleteClick={onRecentCalculationDeleteClick}
        onClearAllClick={onClearAllClick}
      />
    );

    const clearAllBtn = screen.getByTestId("recent-calculations-clear-all");
    fireEvent.click(clearAllBtn);
    expect(onClearAllClick).toHaveBeenCalledTimes(1);
  });

  it("returns null when recentCalculations is empty", () => {
    const { container } = render(
      <RecentCalculations
        recentCalculations={[]}
        onRecentCalculationClick={jest.fn()}
        onRecentCalculationDeleteClick={jest.fn()}
        onClearAllClick={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
