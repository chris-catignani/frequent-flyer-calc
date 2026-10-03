import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AlaskaCalculator } from "./calculator";

jest.mock("posthog-js", () => ({ capture: jest.fn() }));
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null, toString: () => "" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/alaska",
}));

describe("AlaskaCalculator", () => {
  it("renders Atmos inputs with Alaska as the default airline and no fare class for distance", () => {
    render(<AlaskaCalculator />);
    expect(screen.getByTestId("earn-method-distance")).toBeInTheDocument();
    expect(screen.getByTestId("segment-fare-class-not-required-0")).toBeInTheDocument();
    expect(screen.getByTestId("elite-status-input")).toBeInTheDocument();
  });

  it("shows a fare error instead of calculating when price paid has no fare", () => {
    render(<AlaskaCalculator />);
    fireEvent.click(screen.getByTestId("earn-method-price"));
    fireEvent.click(screen.getByTestId("calculate-button"));
    expect(screen.getByTestId("fare-usd-input-error")).toHaveTextContent("Enter the fare paid");
  });
});
