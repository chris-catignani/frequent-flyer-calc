import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  SegmentInputList,
  GenericFareClassInput,
  validate,
  buildAirlineOptions,
  type SegmentInputAdapter,
} from "./segmentInput";
import { SegmentInput } from "@/app/_shared/models/segmentInput";

describe("SegmentInputList & SegmentInputAdapter", () => {
  const airlineOptions = buildAirlineOptions(["qf", "aa", "ba"], "Oneworld");

  const defaultSegment = new SegmentInput("qf", "j", "syd", "mel", "test-uuid-1");
  defaultSegment.fromAirport = {
    iata: "syd",
    name: "Sydney Airport",
    city: "Sydney",
    country: "Australia",
    latitude: -33.946,
    longitude: 151.177,
  };
  defaultSegment.toAirport = {
    iata: "mel",
    name: "Melbourne Airport",
    city: "Melbourne",
    country: "Australia",
    latitude: -37.673,
    longitude: 144.843,
  };

  describe("Default rendering (without adapter)", () => {
    it("renders default free-text fare class input when no adapter is provided", () => {
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={jest.fn()}
          onSegmentsReordered={jest.fn()}
        />
      );

      const fareClassInput = screen.getByTestId("segment-fare-class-0");
      expect(fareClassInput).toBeInTheDocument();
      // The default free-text input has label "Fare Class (e.g. \"y\" or \"i\")"
      expect(screen.getByLabelText(/Fare Class \(e\.g\. "y" or "i"\)/i)).toBeInTheDocument();
    });

    it("calls onSegmentInputChanged with lowercased fare class when typed into default input", () => {
      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
        />
      );

      const input = screen.getByRole("textbox", { name: /Fare Class/i });
      fireEvent.change(input, { target: { value: "Y" } });

      expect(onSegmentInputChanged).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ fareClass: "y" })
      );
    });
  });

  describe("Custom rendering with adapter", () => {
    it("renders custom fare class input when adapter.renderFareClassInput returns a node", () => {
      const adapter: SegmentInputAdapter = {
        renderFareClassInput: ({ segmentInputIdx, segmentInput, onChange }) => (
          <button
            data-testid={`custom-fare-input-${segmentInputIdx}`}
            onClick={() => onChange("flexibleEconomy")}
          >
            Custom: {segmentInput.fareClass}
          </button>
        ),
      };

      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      expect(screen.getByTestId("custom-fare-input-0")).toBeInTheDocument();
      expect(screen.queryByLabelText(/Fare Class \(e\.g\. "y" or "i"\)/i)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("custom-fare-input-0"));
      expect(onSegmentInputChanged).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ fareClass: "flexibleEconomy" })
      );
    });

    it("falls back to free-text when adapter.renderFareClassInput returns null", () => {
      const adapter: SegmentInputAdapter = {
        renderFareClassInput: () => null,
      };

      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={jest.fn()}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      expect(screen.getByLabelText(/Fare Class \(e\.g\. "y" or "i"\)/i)).toBeInTheDocument();
    });

    it("falls back to free-text when adapter.renderFareClassInput returns undefined", () => {
      const adapter: SegmentInputAdapter = {
        renderFareClassInput: () => undefined,
      };

      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={jest.fn()}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      expect(screen.getByLabelText(/Fare Class \(e\.g\. "y" or "i"\)/i)).toBeInTheDocument();
    });
  });

  describe("Airline and airport change clearing behavior with adapter", () => {
    it("clears fare class on airline change if shouldClearFareClassOnAirlineChange returns true", () => {
      const adapter: SegmentInputAdapter = {
        shouldClearFareClassOnAirlineChange: jest.fn(() => true),
      };

      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      const airlineInput = screen.getByRole("combobox", { name: /Airline/i });
      fireEvent.change(airlineInput, { target: { value: "aa" } });
      fireEvent.keyDown(airlineInput, { key: "ArrowDown" });
      fireEvent.keyDown(airlineInput, { key: "Enter" });

      expect(adapter.shouldClearFareClassOnAirlineChange).toHaveBeenCalledWith(
        defaultSegment,
        expect.any(String)
      );
    });

    it("clears fare class on from airport change if shouldClearFareClassOnAirportChange returns true", () => {
      const adapter: SegmentInputAdapter = {
        shouldClearFareClassOnAirportChange: jest.fn(() => true),
      };

      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      const fromInput = screen.getByRole("combobox", { name: /From/i });
      fireEvent.change(fromInput, { target: { value: "bne" } });

      expect(adapter.shouldClearFareClassOnAirportChange).toHaveBeenCalledWith(
        defaultSegment,
        "from",
        "bne"
      );
      expect(onSegmentInputChanged).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          fromAirportText: "bne",
          fareClass: "",
        })
      );
    });

    it("clears fare class on to airport change if shouldClearFareClassOnAirportChange returns true", () => {
      const adapter: SegmentInputAdapter = {
        shouldClearFareClassOnAirportChange: jest.fn(() => true),
      };

      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      const toInput = screen.getByRole("combobox", { name: /To/i });
      fireEvent.change(toInput, { target: { value: "per" } });

      expect(adapter.shouldClearFareClassOnAirportChange).toHaveBeenCalledWith(
        defaultSegment,
        "to",
        "per"
      );
      expect(onSegmentInputChanged).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          toAirportText: "per",
          fareClass: "",
        })
      );
    });

    it("preserves fare class when shouldClearFareClassOnAirportChange returns false", () => {
      const adapter: SegmentInputAdapter = {
        shouldClearFareClassOnAirportChange: jest.fn(() => false),
      };

      const onSegmentInputChanged = jest.fn();
      render(
        <SegmentInputList
          segmentInputs={[defaultSegment]}
          errors={{}}
          airlineOptions={airlineOptions}
          onDeleteSegmentPressed={jest.fn()}
          onSegmentInputChanged={onSegmentInputChanged}
          onSegmentsReordered={jest.fn()}
          adapter={adapter}
        />
      );

      const toInput = screen.getByRole("combobox", { name: /To/i });
      fireEvent.change(toInput, { target: { value: "per" } });

      expect(onSegmentInputChanged).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          toAirportText: "per",
          fareClass: "j",
        })
      );
    });
  });

  describe("Validation", () => {
    it("validates base required fields without adapter", () => {
      const emptySegment = new SegmentInput("", "", "", "", "test-uuid-2");
      const errors = validate([emptySegment]);

      expect(errors[0]).toEqual({
        airline: "Required",
        fromAirportText: "Required",
        toAirportText: "Required",
        fareClass: "Required",
      });
    });

    it("validates invalid IATA codes", () => {
      const invalidIataSegment = new SegmentInput("qf", "j", "xyz123", "abc999", "test-uuid-3");
      const errors = validate([invalidIataSegment]);

      expect(errors[0]).toEqual({
        fromAirportText: "Invalid IATA",
        toAirportText: "Invalid IATA",
      });
    });

    it("incorporates custom validation from adapter.validateSegment", () => {
      const adapter: SegmentInputAdapter = {
        validateSegment: (segment) => {
          if (segment.fareClass === "invalid") {
            return { fareClass: "Unknown fare class" };
          }
          return undefined;
        },
      };

      const segment = defaultSegment.clone({ fareClass: "invalid" });
      const errors = validate([segment], adapter);

      expect(errors[0]).toEqual({
        fareClass: "Unknown fare class",
      });
    });
  });

  describe("GenericFareClassInput", () => {
    it("renders options with displayLookup labels and handles change", () => {
      const onChange = jest.fn();
      render(
        <GenericFareClassInput
          segmentInputIdx={0}
          options={["eco", "bus"]}
          value="eco"
          displayLookup={{ eco: "Economy", bus: "Business" }}
          onChange={onChange}
        />
      );

      const combobox = screen.getByRole("combobox", { name: /Fare Class/i });
      expect(combobox).toBeInTheDocument();
      expect(combobox).toHaveValue("Economy");
    });

    it("displays error helperText when error prop is provided", () => {
      render(
        <GenericFareClassInput
          segmentInputIdx={0}
          options={["eco", "bus"]}
          value=""
          displayLookup={{ eco: "Economy", bus: "Business" }}
          onChange={jest.fn()}
          error="Required"
        />
      );

      expect(screen.getByTestId("segment-error-fare-class-0")).toHaveTextContent("Required");
    });
  });
});
