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
});
