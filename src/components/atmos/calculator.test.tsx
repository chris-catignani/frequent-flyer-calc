import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AtmosCalculator } from "./calculator";

jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null, toString: () => "" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/atmos",
}));

const selectEarnMethod = (label: string) => {
  fireEvent.focus(within(screen.getByTestId("earn-method-input")).getByRole("combobox"));
  fireEvent.mouseDown(screen.getByRole("option", { name: label }));
};

describe("AtmosCalculator", () => {
  it("renders Atmos inputs with Alaska as the default airline and no fare class for distance", () => {
    render(<AtmosCalculator />);
    expect(screen.getByTestId("earn-method-input")).toBeInTheDocument();
    expect(screen.getByTestId("booking-type-cash")).toBeInTheDocument();
    expect(screen.getByTestId("elite-status-input")).toBeInTheDocument();
    expect(screen.getByTestId("community-select")).toBeInTheDocument();
    expect(screen.queryByTestId("segment-fare-class-0")).toBeNull();
  });

  it("shows a fare error instead of calculating when price paid has no fare", () => {
    render(<AtmosCalculator />);
    selectEarnMethod("Price paid");
    fireEvent.click(screen.getByTestId("calculate-button"));
    expect(screen.getByTestId("fare-usd-input-error")).toHaveTextContent("Enter the fare paid");
    expect(screen.queryByTestId("total-points-earned")).toBeNull();
  });
});
