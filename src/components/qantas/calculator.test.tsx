import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QantasCalculator } from "./calculator";

jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

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

describe("QantasCalculator", () => {
  it("renders trip type toggle, add segment button, and calculate button", () => {
    render(<QantasCalculator />);
    expect(screen.getByTestId("trip-type-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("add-segment-button")).toBeInTheDocument();
    expect(screen.getByTestId("calculate-button")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /compare with qantas/i })).toBeInTheDocument();
  });
});
