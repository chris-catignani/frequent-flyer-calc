import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SegmentInput } from "@/models/segmentInput";
import type { Airport } from "@/types/airport";
import {
  QantasFareClassInput,
  JetstarFareClassInput,
  JALFareClassInput,
  qantasSegmentInputAdapter,
} from "./fareClassInput";

const syd: Airport = {
  iata: "syd",
  name: "Sydney Airport",
  city: "Sydney",
  country: "Australia",
  state: "NSW",
  latitude: -33.9461,
  longitude: 151.1772,
};

const mel: Airport = {
  iata: "mel",
  name: "Melbourne Airport",
  city: "Melbourne",
  country: "Australia",
  state: "VIC",
  latitude: -37.6733,
  longitude: 144.8433,
};

const lax: Airport = {
  iata: "lax",
  name: "Los Angeles International Airport",
  city: "Los Angeles",
  country: "United States",
  state: "CA",
  latitude: 33.9425,
  longitude: -118.4081,
};

const akl: Airport = {
  iata: "akl",
  name: "Auckland Airport",
  city: "Auckland",
  country: "New Zealand",
  state: "AUK",
  latitude: -37.0081,
  longitude: 174.792,
};

const wlg: Airport = {
  iata: "wlg",
  name: "Wellington International Airport",
  city: "Wellington",
  country: "New Zealand",
  state: "WGN",
  latitude: -41.3272,
  longitude: 174.8053,
};

const dps: Airport = {
  iata: "dps",
  name: "Ngurah Rai International Airport",
  city: "Denpasar",
  country: "Indonesia",
  state: "BAL",
  latitude: -8.7482,
  longitude: 115.1672,
};

const hnd: Airport = {
  iata: "hnd",
  name: "Tokyo Haneda Airport",
  city: "Tokyo",
  country: "Japan",
  state: "TK",
  latitude: 35.5533,
  longitude: 139.7811,
};

const itm: Airport = {
  iata: "itm",
  name: "Osaka Itami Airport",
  city: "Osaka",
  country: "Japan",
  state: "OS",
  latitude: 34.7855,
  longitude: 135.4382,
};

describe("fareClassInput components & adapter", () => {
  describe("QantasFareClassInput", () => {
    it("renders domestic options and booking class letters when both airports are Australia", () => {
      const segmentInput = new SegmentInput("qf", "RedeDeal", "syd", "mel");
      segmentInput.fromAirport = syd;
      segmentInput.toAirport = mel;
      const onChange = jest.fn();

      render(
        <QantasFareClassInput segmentInputIdx={0} segmentInput={segmentInput} onChange={onChange} />
      );

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
      // Open autocomplete dropdown
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      // Domestic options like Red e-Deal and single letters (e.g. "b", "e") should be present
      expect(screen.getByRole("option", { name: "Red e-Deal" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Flex" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "e" })).toBeInTheDocument();
      // International-only option should not be in the list
      expect(screen.queryByRole("option", { name: "Economy Saver" })).not.toBeInTheDocument();
    });

    it("renders international options and booking class letters when route is international", () => {
      const segmentInput = new SegmentInput("qf", "EconomySaver", "syd", "lax");
      segmentInput.fromAirport = syd;
      segmentInput.toAirport = lax;
      const onChange = jest.fn();

      render(
        <QantasFareClassInput segmentInputIdx={0} segmentInput={segmentInput} onChange={onChange} />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(screen.getByRole("option", { name: "Economy Saver" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Economy Sale" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Red e-Deal" })).not.toBeInTheDocument();
    });

    it("renders empty options if airports are not set", () => {
      const segmentInput = new SegmentInput("qf", "", "", "");
      const onChange = jest.fn();

      render(
        <QantasFareClassInput segmentInputIdx={0} segmentInput={segmentInput} onChange={onChange} />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });
  });

  describe("JetstarFareClassInput", () => {
    it("renders NZ domestic options when airline is jq and route is NZ domestic", () => {
      const segmentInput = new SegmentInput("jq", "", "akl", "wlg");
      segmentInput.fromAirport = akl;
      segmentInput.toAirport = wlg;
      const onChange = jest.fn();

      render(
        <JetstarFareClassInput
          segmentInputIdx={0}
          segmentInput={segmentInput}
          onChange={onChange}
        />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(screen.getByRole("option", { name: "Starter FlexBiz Fare" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Business Max" })).not.toBeInTheDocument();
    });

    it("renders AU domestic options when airline is jq and route is AU domestic", () => {
      const segmentInput = new SegmentInput("jq", "", "syd", "mel");
      segmentInput.fromAirport = syd;
      segmentInput.toAirport = mel;
      const onChange = jest.fn();

      render(
        <JetstarFareClassInput
          segmentInputIdx={0}
          segmentInput={segmentInput}
          onChange={onChange}
        />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(screen.getByRole("option", { name: "Business Max" })).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Starter FlexBiz Fare" })
      ).not.toBeInTheDocument();
    });

    it("renders international options for Jetstar intl route or other Jetstar airlines (e.g. gk)", () => {
      const segmentInput = new SegmentInput("jq", "", "syd", "dps");
      segmentInput.fromAirport = syd;
      segmentInput.toAirport = dps;
      const onChange = jest.fn();

      render(
        <JetstarFareClassInput
          segmentInputIdx={0}
          segmentInput={segmentInput}
          onChange={onChange}
        />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(screen.getByRole("option", { name: "More" })).toBeInTheDocument();
    });
  });

  describe("JALFareClassInput", () => {
    it("renders JAL domestic fare class options", () => {
      const segmentInput = new SegmentInput("jl", "", "hnd", "itm");
      segmentInput.fromAirport = hnd;
      segmentInput.toAirport = itm;
      const onChange = jest.fn();

      render(
        <JALFareClassInput segmentInputIdx={0} segmentInput={segmentInput} onChange={onChange} />
      );

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(screen.getByRole("option", { name: "Discount Economy" })).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Discount Economy plus Premium Surcharge" })
      ).toBeInTheDocument();
    });
  });

  describe("qantasSegmentInputAdapter", () => {
    describe("renderFareClassInput", () => {
      it("renders QantasFareClassInput for qf", () => {
        const segmentInput = new SegmentInput("qf", "", "syd", "mel");
        segmentInput.fromAirport = syd;
        segmentInput.toAirport = mel;
        const rendered = qantasSegmentInputAdapter.renderFareClassInput?.({
          segmentInputIdx: 0,
          segmentInput,
          onChange: jest.fn(),
        });
        expect(rendered).not.toBeNull();
        const { getByRole } = render(<div>{rendered}</div>);
        expect(getByRole("combobox")).toBeInTheDocument();
      });

      it("renders JetstarFareClassInput for jq and gk", () => {
        for (const airline of ["jq", "gk"]) {
          const segmentInput = new SegmentInput(airline, "", "syd", "mel");
          segmentInput.fromAirport = syd;
          segmentInput.toAirport = mel;
          const rendered = qantasSegmentInputAdapter.renderFareClassInput?.({
            segmentInputIdx: 0,
            segmentInput,
            onChange: jest.fn(),
          });
          expect(rendered).not.toBeNull();
        }
      });

      it("renders JALFareClassInput for jl/nu when both airports are Japan", () => {
        const segmentInput = new SegmentInput("jl", "", "hnd", "itm");
        segmentInput.fromAirport = hnd;
        segmentInput.toAirport = itm;
        const rendered = qantasSegmentInputAdapter.renderFareClassInput?.({
          segmentInputIdx: 0,
          segmentInput,
          onChange: jest.fn(),
        });
        expect(rendered).not.toBeNull();
      });

      it("returns null for JAL when route is international", () => {
        const segmentInput = new SegmentInput("jl", "", "hnd", "syd");
        segmentInput.fromAirport = hnd;
        segmentInput.toAirport = syd;
        const rendered = qantasSegmentInputAdapter.renderFareClassInput?.({
          segmentInputIdx: 0,
          segmentInput,
          onChange: jest.fn(),
        });
        expect(rendered).toBeNull();
      });

      it("returns null for other partner airlines", () => {
        const segmentInput = new SegmentInput("aa", "", "lax", "syd");
        segmentInput.fromAirport = lax;
        segmentInput.toAirport = syd;
        const rendered = qantasSegmentInputAdapter.renderFareClassInput?.({
          segmentInputIdx: 0,
          segmentInput,
          onChange: jest.fn(),
        });
        expect(rendered).toBeNull();
      });
    });

    describe("shouldClearFareClassOnAirlineChange", () => {
      it("returns false if airline does not change", () => {
        const seg = new SegmentInput("qf", "RedeDeal", "syd", "mel");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(seg, "qf")).toBe(
          false
        );
      });

      it("returns true when switching between Qantas Group airlines or to/from Qantas Group", () => {
        const qfSeg = new SegmentInput("qf", "RedeDeal", "syd", "mel");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(qfSeg, "jq")).toBe(
          true
        );
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(qfSeg, "aa")).toBe(
          true
        );

        const aaSeg = new SegmentInput("aa", "y", "lax", "syd");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(aaSeg, "qf")).toBe(
          true
        );
      });

      it("returns true when switching between JAL airlines or to/from JAL", () => {
        const jlSeg = new SegmentInput("jl", "Economy", "hnd", "itm");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(jlSeg, "nu")).toBe(
          true
        );
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(jlSeg, "aa")).toBe(
          true
        );

        const aaSeg = new SegmentInput("aa", "y", "lax", "syd");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(aaSeg, "jl")).toBe(
          true
        );
      });

      it("returns false when switching between non-Qantas non-JAL partner airlines", () => {
        const aaSeg = new SegmentInput("aa", "y", "lax", "syd");
        expect(qantasSegmentInputAdapter.shouldClearFareClassOnAirlineChange?.(aaSeg, "ba")).toBe(
          false
        );
      });
    });

    describe("shouldClearFareClassOnAirportChange", () => {
      it("always returns true for JAL airlines regardless of input length", () => {
        const jlSeg = new SegmentInput("jl", "Economy", "hnd", "itm");
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(jlSeg, "from", "h")
        ).toBe(true);
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(jlSeg, "to", "hnd")
        ).toBe(true);
      });

      it("returns true for Qantas Group only when newAirportText has length 3", () => {
        const qfSeg = new SegmentInput("qf", "RedeDeal", "syd", "mel");
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(qfSeg, "from", "s")
        ).toBe(false);
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(qfSeg, "from", "sy")
        ).toBe(false);
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(qfSeg, "from", "syd")
        ).toBe(true);
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(qfSeg, "from", "sydd")
        ).toBe(false);
      });

      it("returns false for partner airlines even with 3-letter IATA", () => {
        const aaSeg = new SegmentInput("aa", "y", "lax", "syd");
        expect(
          qantasSegmentInputAdapter.shouldClearFareClassOnAirportChange?.(aaSeg, "from", "syd")
        ).toBe(false);
      });
    });
  });
});
