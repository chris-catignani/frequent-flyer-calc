import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProgramNav } from "./programNav";

describe("ProgramNav", () => {
  it("shows the current program and hides the menu until opened", () => {
    render(<ProgramNav current="/alaska" />);
    const button = screen.getByTestId("program-nav-button");
    expect(button).toHaveTextContent("Atmos Rewards");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Qantas" })).toBeNull();
  });

  it("opens a menu linking to both calculators with the current one marked", () => {
    render(<ProgramNav current="/alaska" />);
    fireEvent.click(screen.getByTestId("program-nav-button"));
    expect(screen.getByTestId("program-nav-button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Qantas" })).toHaveAttribute("href", "/qantas");
    expect(screen.getByRole("link", { name: "Atmos Rewards" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("closes on Escape and on outside click", () => {
    render(<ProgramNav current="/qantas" />);
    const button = screen.getByTestId("program-nav-button");

    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    fireEvent.pointerDown(document.body);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
