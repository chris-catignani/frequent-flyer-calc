import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByTestId("trip-type-oneway")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("trip-type-return")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("add-segment-button")).toBeInTheDocument();
    expect(screen.getByTestId("calculate-button")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /compare with qantas/i })).toBeInTheDocument();
  });

  it("toggles trip type when clicked", () => {
    render(<QantasCalculator />);
    const returnBtn = screen.getByTestId("trip-type-return");
    fireEvent.click(returnBtn);
    expect(returnBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("trip-type-oneway")).toHaveAttribute("aria-pressed", "false");
  });

  it("opens Compare with Qantas info dialog when info button is clicked", () => {
    render(<QantasCalculator />);
    const infoButton = screen.getByLabelText("Learn more about comparing with Qantas calculator");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(infoButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Compare with Qantas")).toBeInTheDocument();
    expect(
      screen.getByText(/This enables us to compare our results with Qantas's website/i)
    ).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles the compare with Qantas switch", () => {
    render(<QantasCalculator />);
    const compareSwitch = screen.getByRole("switch", { name: /compare with qantas/i });
    expect(compareSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(compareSwitch);
    expect(compareSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(compareSwitch);
    expect(compareSwitch).toHaveAttribute("aria-checked", "false");
  });
});
