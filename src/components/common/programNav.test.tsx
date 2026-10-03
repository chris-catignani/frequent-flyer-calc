import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProgramNav } from "./programNav";

describe("ProgramNav", () => {
  it("links to both calculators and marks the current one", () => {
    render(<ProgramNav current="/alaska" />);
    expect(screen.getByRole("link", { name: "Qantas" })).toHaveAttribute("href", "/qantas");
    expect(screen.getByRole("link", { name: "Atmos Rewards" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
