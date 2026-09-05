import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Qantas from "./page";

// Mock posthog-js
jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
    toString: () => "",
  }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/qantas",
}));

describe("Qantas Page Accessibility & Structure", () => {
  it("renders a main landmark", () => {
    render(<Qantas />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders h1 page heading", () => {
    render(<Qantas />);
    expect(
      screen.getByRole("heading", {
        name: "Qantas Points and Status Credits Calculator",
        level: 1,
      })
    ).toBeInTheDocument();
  });

  it("renders the Compare with Qantas switch with accessible name", () => {
    render(<Qantas />);
    const compareSwitch = screen.getByRole("switch", {
      name: /compare with qantas/i,
    });
    expect(compareSwitch).toBeInTheDocument();
  });
});
