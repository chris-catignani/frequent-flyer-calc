import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  BookingTypeToggle,
  EarnMethodInput,
  GlobalLocalsCheckbox,
  PricePaidOptions,
} from "./ticketOptions";
import { DEFAULT_ATMOS_OPTIONS } from "@/calculators/alaska/options";

describe("EarnMethodInput", () => {
  it("shows the selected method and reports a new one", () => {
    const onChange = jest.fn();
    render(<EarnMethodInput value="distance" onChange={onChange} />);
    const input = within(screen.getByTestId("earn-method-input")).getByRole("combobox");
    expect(input).toHaveValue("Distance traveled");

    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByRole("option", { name: "Segments flown" }));
    expect(onChange).toHaveBeenCalledWith("segments");
  });
});

describe("BookingTypeToggle", () => {
  it("marks the selected booking type and reports changes", () => {
    const onChange = jest.fn();
    render(<BookingTypeToggle value="cash" onChange={onChange} />);
    expect(screen.getByTestId("booking-type-cash")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByTestId("booking-type-award"));
    expect(onChange).toHaveBeenCalledWith("award");
  });
});

describe("GlobalLocalsCheckbox", () => {
  it("reports changes", () => {
    const onChange = jest.fn();
    render(<GlobalLocalsCheckbox checked={false} onChange={onChange} />);
    expect(screen.getByTestId("global-locals-checkbox")).not.toBeChecked();
    fireEvent.click(screen.getByTestId("global-locals-checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("PricePaidOptions", () => {
  it("renders nothing unless earning by price paid", () => {
    const { container } = render(
      <PricePaidOptions options={DEFAULT_ATMOS_OPTIONS} errors={{}} onChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows issuer and fare for price + cash, and points redeemed for price + award", () => {
    const { rerender } = render(
      <PricePaidOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price" }}
        errors={{ fareUsd: "Enter the fare paid" }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("ticket-issuer-select")).toBeInTheDocument();
    expect(screen.getByTestId("fare-usd-input")).toBeInTheDocument();
    expect(screen.getByTestId("fare-usd-input-error")).toHaveTextContent("Enter the fare paid");

    rerender(
      <PricePaidOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price", bookingType: "award" }}
        errors={{}}
        onChange={jest.fn()}
      />
    );
    expect(screen.queryByTestId("ticket-issuer-select")).toBeNull();
    expect(screen.getByTestId("points-redeemed-input")).toBeInTheDocument();
  });

  it("hides the fare field for partner-issued tickets", () => {
    render(
      <PricePaidOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price", ticketIssuer: "other" }}
        errors={{}}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("ticket-issuer-select")).toBeInTheDocument();
    expect(screen.queryByTestId("fare-usd-input")).toBeNull();
  });

  it("reports changes", () => {
    const onChange = jest.fn();
    render(
      <PricePaidOptions
        options={{ ...DEFAULT_ATMOS_OPTIONS, earnMethod: "price" }}
        errors={{}}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByTestId("fare-usd-input"), { target: { value: "480.5" } });
    expect(onChange).toHaveBeenCalledWith({ fareUsd: 480.5 });
    fireEvent.change(screen.getByTestId("ticket-issuer-select"), { target: { value: "other" } });
    expect(onChange).toHaveBeenCalledWith({ ticketIssuer: "other" });
  });
});
