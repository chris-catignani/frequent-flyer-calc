import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SegmentResults } from "./segmentResults";
import { buildSegment } from "@/test/testUtils";
import type { CalculationResult } from "@/types/calculator";

describe("SegmentResults", () => {
  it("renders nothing when calculatedData is null", () => {
    const { container } = render(
      <SegmentResults calculatedData={null} compareWithQantasCalc={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders segments and allows expanding details", () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockData: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 1750,
          elitePoints: 40,
          fareEarnCategory: "flexibleBusiness",
          ruleName: "Qantas Domestic Earning Table",
          ruleUrl: "https://example.com/rule",
          notes: "Standard earning",
          airlinePointsBreakdown: {
            basePoints: 1400,
            eliteBonus: {
              airlinePoints: 350,
            },
            minPoints: 800,
            totalEarned: 1750,
          },
        },
      ],
      containsErrors: false,
      airlinePoints: 1750,
      elitePoints: 40,
    };

    render(<SegmentResults calculatedData={mockData} compareWithQantasCalc={false} />);

    expect(screen.getByTestId("segment-results-table")).toBeInTheDocument();
    expect(screen.getByTestId("segment-result-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("segment-result-route-0")).toHaveTextContent("syd - mel");
    expect(screen.getByTestId("segment-result-points-0")).toHaveTextContent("1,750");
    expect(screen.getByTestId("segment-result-status-credits-0")).toHaveTextContent("40");

    // Click to expand row
    const toggleButton = screen.getByLabelText("Show calculation breakdown for segment 1");
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Hide calculation breakdown for segment 1")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText(/Airline:\s*Qantas/)).toBeInTheDocument();
    expect(screen.getByText(/Calculation Notes:\s*Standard earning/)).toBeInTheDocument();

    // Click info icon for breakdown dialog
    const breakdownButton = screen.getByLabelText("View points calculation breakdown");
    fireEvent.click(breakdownButton);

    expect(screen.getByText("Points Calculation Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Total Points: 1,750")).toBeInTheDocument();
    expect(screen.getByText("Base Points: 1,400")).toBeInTheDocument();
    expect(screen.getByText("Elite Bonus: 350")).toBeInTheDocument();
  });

  it("renders error row when segment contains an error", () => {
    const segment = buildSegment("zz", "y", "syd", "mel");
    const mockData: CalculationResult = {
      segmentResults: [
        {
          segment,
          airlinePoints: 0,
          elitePoints: 0,
          error: new Error("Unsupported airline ZZ"),
        },
      ],
      containsErrors: true,
      airlinePoints: 0,
      elitePoints: 0,
    };

    render(<SegmentResults calculatedData={mockData} compareWithQantasCalc={false} />);

    expect(screen.getByTestId("segment-result-row-0")).toBeInTheDocument();
    expect(screen.getByText("Unsupported airline ZZ")).toBeInTheDocument();
  });

  it("handles Qantas comparison match and mismatch dialogs", async () => {
    const segment = buildSegment("qf", "i", "syd", "mel");
    const mockData: CalculationResult = {
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

    render(<SegmentResults calculatedData={mockData} compareWithQantasCalc={true} />);

    const mismatchButton = screen.getByLabelText(
      "Does not match Qantas Calculator for this segment"
    );
    fireEvent.click(mismatchButton);

    expect(
      screen.getByText("Qantas Calculator results do not match our results for this segment")
    ).toBeInTheDocument();

    const backdrop = screen.getByTestId("dialog-backdrop");
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(
        screen.queryByText("Qantas Calculator results do not match our results for this segment")
      ).not.toBeInTheDocument();
    });
  });
});
