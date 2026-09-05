import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FaqAndInfo } from "./faqAndInfo";

describe("FaqAndInfo", () => {
  it("renders key heading guides and key rules", () => {
    render(<FaqAndInfo />);

    expect(
      screen.getByText("How Qantas Points & Status Credits Are Calculated")
    ).toBeInTheDocument();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("Distance Bands & Minimums")).toBeInTheDocument();
    expect(screen.getByText("Elite Status Tier Multipliers")).toBeInTheDocument();
    expect(screen.getByText("Partner Airlines & Alliances")).toBeInTheDocument();
  });

  it("renders the FAQ questions and official links", () => {
    render(<FaqAndInfo />);

    expect(
      screen.getByText("How are Qantas Points and Status Credits calculated?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Where can I find official Qantas earning tables and fare classes?")
    ).toBeInTheDocument();
    expect(screen.getByText("How do elite status tier bonuses work?")).toBeInTheDocument();
    expect(screen.getByText("Which partner airlines earn Status Credits?")).toBeInTheDocument();
    expect(
      screen.getByText("Do Jetstar flights earn Qantas Points and Status Credits?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Why do some results differ slightly from the official Qantas calculator?")
    ).toBeInTheDocument();
    expect(screen.getByText("What is a Status Run?")).toBeInTheDocument();
  });

  it("renders subsections with proper h3 heading level", () => {
    render(<FaqAndInfo />);

    expect(
      screen.getByRole("heading", { name: "Distance Bands & Minimums", level: 3 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Elite Status Tier Multipliers", level: 3 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Partner Airlines & Alliances", level: 3 })
    ).toBeInTheDocument();
  });

  it("does not render duplicate ARIA content IDs for FAQ items", () => {
    const { container } = render(<FaqAndInfo />);

    for (let i = 1; i <= 7; i++) {
      const elementsWithId = container.querySelectorAll(`#faq${i}-content`);
      expect(elementsWithId.length).toBeLessThanOrEqual(1);
    }
  });
});
