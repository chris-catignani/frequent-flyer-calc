import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CalculatorSkeleton } from "./calculatorSkeleton";

describe("CalculatorSkeleton", () => {
  it("renders with aria-busy and accessible status label", () => {
    render(<CalculatorSkeleton />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/loading calculator/i)).toBeInTheDocument();
  });

  it("includes minimum height and margin classes matching the default form card", () => {
    const { container } = render(<CalculatorSkeleton />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("min-h-[340px]");
    expect(card.className).toContain("sm:min-h-[260px]");
    expect(card.className).toContain("mt-4");
  });
});
