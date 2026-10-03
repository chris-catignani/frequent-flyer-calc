import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AlaskaCalculator } from "./calculator";

jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null, toString: () => "" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/alaska",
}));

const selectEarnMethod = (label: string) => {
  fireEvent.focus(within(screen.getByTestId("earn-method-input")).getByRole("combobox"));
  fireEvent.mouseDown(screen.getByRole("option", { name: label }));
};

describe("AlaskaCalculator", () => {
  it("renders Atmos inputs with Alaska as the default airline and no fare class for distance", () => {
    render(<AlaskaCalculator />);
    expect(screen.getByTestId("earn-method-input")).toBeInTheDocument();
    expect(screen.getByTestId("booking-type-cash")).toBeInTheDocument();
    expect(screen.getByTestId("elite-status-input")).toBeInTheDocument();
    expect(screen.getByTestId("global-locals-checkbox")).toBeInTheDocument();
    expect(screen.queryByTestId("segment-fare-class-0")).toBeNull();
  });

  it("shows a fare error instead of calculating when price paid has no fare", () => {
    render(<AlaskaCalculator />);
    selectEarnMethod("Price paid");
    fireEvent.click(screen.getByTestId("calculate-button"));
    expect(screen.getByTestId("fare-usd-input-error")).toHaveTextContent("Enter the fare paid");
    expect(screen.queryByTestId("total-points-earned")).toBeNull();
  });
});
