import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdvancedInput } from "./advancedInput";

describe("AdvancedInput", () => {
  it("renders closed initially and expands on toggle click", () => {
    const setSegmentInputs = jest.fn();
    render(<AdvancedInput setSegmentInputs={setSegmentInputs} />);

    const toggle = screen.getByTestId("advanced-input-toggle");
    expect(toggle).toBeInTheDocument();
    expect(screen.queryByTestId("advanced-input-text-accordion")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByTestId("advanced-input-text-accordion")).toBeInTheDocument();
    expect(screen.getByTestId("advanced-input-ita-accordion")).toBeInTheDocument();
  });

  it("expands free form text accordion and applies valid itinerary", () => {
    const setSegmentInputs = jest.fn();
    render(<AdvancedInput setSegmentInputs={setSegmentInputs} />);

    // Open advanced input
    fireEvent.click(screen.getByTestId("advanced-input-toggle"));

    // Open text accordion
    fireEvent.click(screen.getByTestId("advanced-input-text-accordion"));

    const textField = screen
      .getByTestId("advanced-input-text-field")
      .querySelector("textarea") as HTMLTextAreaElement;
    expect(textField).toBeInTheDocument();

    fireEvent.change(textField, { target: { value: "qf syd mel y" } });
    fireEvent.click(screen.getByTestId("advanced-input-text-apply-button"));

    expect(setSegmentInputs).toHaveBeenCalledTimes(1);
    expect(setSegmentInputs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          airline: "qf",
          fromAirportText: "syd",
          toAirportText: "mel",
          fareClass: "y",
        }),
      ])
    );
    // Advanced input closes after apply
    expect(screen.queryByTestId("advanced-input-text-accordion")).not.toBeInTheDocument();
  });

  it("shows error when invalid text itinerary is applied", () => {
    const setSegmentInputs = jest.fn();
    render(<AdvancedInput setSegmentInputs={setSegmentInputs} />);

    fireEvent.click(screen.getByTestId("advanced-input-toggle"));
    fireEvent.click(screen.getByTestId("advanced-input-text-accordion"));

    const textField = screen
      .getByTestId("advanced-input-text-field")
      .querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(textField, { target: { value: "invalid line input" } });
    fireEvent.click(screen.getByTestId("advanced-input-text-apply-button"));

    expect(setSegmentInputs).not.toHaveBeenCalled();
    expect(
      screen.getByText(/"invalid line input" is not formatted correctly/i)
    ).toBeInTheDocument();
  });

  it("expands ITA matrix accordion and applies valid json", () => {
    const setSegmentInputs = jest.fn();
    render(<AdvancedInput setSegmentInputs={setSegmentInputs} />);

    fireEvent.click(screen.getByTestId("advanced-input-toggle"));
    fireEvent.click(screen.getByTestId("advanced-input-ita-accordion"));

    const itaField = screen
      .getByTestId("advanced-input-ita-field")
      .querySelector("textarea") as HTMLTextAreaElement;
    expect(itaField).toBeInTheDocument();

    const validIta = {
      itinerary: {
        slices: [
          {
            segments: [
              {
                carrier: { code: "QF" },
                bookingInfos: [{ bookingCode: "Y" }],
                legs: [{ origin: { code: "SYD" }, destination: { code: "MEL" } }],
              },
            ],
          },
        ],
      },
    };

    fireEvent.change(itaField, { target: { value: JSON.stringify(validIta) } });
    fireEvent.click(screen.getByTestId("advanced-input-ita-apply-button"));

    expect(setSegmentInputs).toHaveBeenCalledTimes(1);
    expect(setSegmentInputs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          airline: "qf",
          fromAirportText: "syd",
          toAirportText: "mel",
          fareClass: "y",
        }),
      ])
    );
  });

  it("shows error when invalid ITA matrix json is applied", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const setSegmentInputs = jest.fn();
    render(<AdvancedInput setSegmentInputs={setSegmentInputs} />);

    fireEvent.click(screen.getByTestId("advanced-input-toggle"));
    fireEvent.click(screen.getByTestId("advanced-input-ita-accordion"));

    const itaField = screen
      .getByTestId("advanced-input-ita-field")
      .querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(itaField, { target: { value: "not json at all" } });
    fireEvent.click(screen.getByTestId("advanced-input-ita-apply-button"));

    expect(setSegmentInputs).not.toHaveBeenCalled();
    expect(screen.getByText("Invalid JSON format")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
