import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TicketOptions } from "./ticketOptions";
import { DEFAULT_ATMOS_OPTIONS } from "@/calculators/alaska/options";

describe("TicketOptions", () => {
  it("shows only method, booking type and Global Locals for distance", () => {
    render(<TicketOptions options={DEFAULT_ATMOS_OPTIONS} errors={{}} onChange={jest.fn()} />);
    expect(screen.getByTestId("earn-method-distance")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByTestId("ticket-issuer-select")).toBeNull();
    expect(screen.queryByTestId("fare-usd-input")).toBeNull();
    expect(screen.getByTestId("global-locals-checkbox")).not.toBeChecked();
  });

  it("shows issuer and fare for price + cash, and points redeemed for price + award", () => {
    const { rerender } = render(
      <TicketOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price" }}
        errors={{ fareUsd: "Enter the fare paid" }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("ticket-issuer-select")).toBeInTheDocument();
    expect(screen.getByTestId("fare-usd-input")).toBeInTheDocument();
    expect(screen.getByTestId("fare-usd-input-error")).toHaveTextContent("Enter the fare paid");

    rerender(
      <TicketOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price", bookingType: "award" }}
        errors={{}}
        onChange={jest.fn()}
      />
    );
    expect(screen.queryByTestId("ticket-issuer-select")).toBeNull();
    expect(screen.getByTestId("points-redeemed-input")).toBeInTheDocument();
  });

  it("reports changes", () => {
    const onChange = jest.fn();
    render(
      <TicketOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price" }}
        errors={{}}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId("earn-method-segments"));
    expect(onChange).toHaveBeenCalledWith({ earnMethod: "segments" });
    fireEvent.change(screen.getByTestId("fare-usd-input"), { target: { value: "480.5" } });
    expect(onChange).toHaveBeenCalledWith({ fareUsd: 480.5 });
    fireEvent.change(screen.getByTestId("ticket-issuer-select"), { target: { value: "other" } });
    expect(onChange).toHaveBeenCalledWith({ ticketIssuer: "other" });
    fireEvent.click(screen.getByTestId("global-locals-checkbox"));
    expect(onChange).toHaveBeenCalledWith({ globalLocals: true });
  });
});
