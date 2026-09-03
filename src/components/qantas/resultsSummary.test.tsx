import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResultsSummary } from "./resultsSummary";
import { buildSegment } from "@/test/testUtils";
import type { CalculationResult } from "@/types/calculator";

describe("ResultsSummary", () => {
  it("renders nothing when calculationOutput is null", () => {
    const { container } = render(
      <ResultsSummary
        calculationOutput={null}
        compareWithQantasCalc={false}
        isCalculating={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders points and status credits when calculationOutput is provided", () => {
    const mockOutput: CalculationResult = {
      segmentResults: [],
      containsErrors: false,
      airlinePoints: 12500,
      elitePoints: 160,
    };

    render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={false}
        isCalculating={false}
      />
    );

    expect(screen.getByTestId("results-summary")).toBeInTheDocument();
    expect(screen.getByTestId("total-points-earned")).toHaveTextContent(
      "Qantas Points Earned: 12,500"
    );
    expect(screen.getByTestId("total-status-credits-earned")).toHaveTextContent(
      "Status Credits Earned: 160"
    );
  });

  it("shows match icon when calculation matches Qantas API", () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockOutput: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          qantasAPIResults: {
            qantasData: {
              airlinePoints: 1750,
              elitePoints: 40,
            },
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    const matchIcons = screen.getAllByLabelText(/Matches Qantas Calculator/);
    expect(matchIcons.length).toBeGreaterThan(0);
  });

  it("shows mismatch dialog when clicked on mismatch icon", () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockOutput: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          qantasAPIResults: {
            qantasData: {
              airlinePoints: 1500,
              elitePoints: 30,
            },
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    const mismatchButtons = screen.getAllByLabelText(
      "View Qantas API calculation mismatch details"
    );
    expect(mismatchButtons.length).toBeGreaterThan(0);

    fireEvent.click(mismatchButtons[0]);
    expect(
      screen.getByText("Qantas Calculator results do not match our results")
    ).toBeInTheDocument();
  });

  it("shows error dialog when clicked on error icon", () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockOutput: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          qantasAPIResults: {
            error: new Error("Rate limit exceeded"),
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    const errorButtons = screen.getAllByLabelText("View Qantas API calculation error details");
    expect(errorButtons.length).toBeGreaterThan(0);

    fireEvent.click(errorButtons[0]);
    expect(
      screen.getByText("Qantas Calculator failed to calculate at least one segment")
    ).toBeInTheDocument();
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("preserves open dialog state across parent re-renders", () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockOutput: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          qantasAPIResults: {
            error: new Error("Rate limit exceeded"),
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    const { rerender } = render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    const errorButtons = screen.getAllByLabelText("View Qantas API calculation error details");
    fireEvent.click(errorButtons[0]);
    expect(
      screen.getByText("Qantas Calculator failed to calculate at least one segment")
    ).toBeInTheDocument();

    // Re-render parent
    rerender(
      <ResultsSummary
        calculationOutput={{ ...mockOutput }}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    // Verify dialog state is retained when the parent re-renders
    expect(
      screen.getByText("Qantas Calculator failed to calculate at least one segment")
    ).toBeInTheDocument();
  });

  it("closes dialog when backdrop is clicked", async () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockOutput: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          qantasAPIResults: {
            error: new Error("Rate limit exceeded"),
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    render(
      <ResultsSummary
        calculationOutput={mockOutput}
        compareWithQantasCalc={true}
        isCalculating={false}
      />
    );

    const errorButtons = screen.getAllByLabelText("View Qantas API calculation error details");
    fireEvent.click(errorButtons[0]);
    expect(
      screen.getByText("Qantas Calculator failed to calculate at least one segment")
    ).toBeInTheDocument();

    const backdrop = document.querySelector(".MuiBackdrop-root");
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    await waitFor(() => {
      expect(
        screen.queryByText("Qantas Calculator failed to calculate at least one segment")
      ).not.toBeInTheDocument();
    });
  });
});
