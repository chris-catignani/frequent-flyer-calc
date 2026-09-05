import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Combobox } from "./combobox";

describe("Combobox Primitive", () => {
  const options = [
    { label: "Sydney (SYD)", value: "syd", group: "Australia" },
    { label: "Melbourne (MEL)", value: "mel", group: "Australia" },
    { label: "Auckland (AKL)", value: "akl", group: "New Zealand" },
  ];

  it("renders input with accessible combobox role, label, and formatted value", () => {
    render(
      <Combobox
        label="Airport"
        options={options}
        value="syd"
        onChange={jest.fn()}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        getOptionValue={(opt) => (typeof opt === "string" ? opt : opt.value)}
        dataTestId="test-combobox"
      />
    );

    const input = screen.getByRole("combobox", { name: /Airport/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Sydney (SYD)");
  });

  it("opens listbox on focus or change and allows keyboard navigation", () => {
    const onChange = jest.fn();
    render(
      <Combobox
        label="Airport"
        options={options}
        value=""
        onChange={onChange}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        getOptionValue={(opt) => (typeof opt === "string" ? opt : opt.value)}
      />
    );

    const input = screen.getByRole("combobox", { name: /Airport/i });
    fireEvent.change(input, { target: { value: "mel" } });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalled();
  });

  it("supports bypass filtering when filterOptions is false", () => {
    render(
      <Combobox
        label="Airport"
        options={options}
        value=""
        filterOptions={false}
        onChange={jest.fn()}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        getOptionValue={(opt) => (typeof opt === "string" ? opt : opt.value)}
      />
    );

    const input = screen.getByRole("combobox", { name: /Airport/i });
    fireEvent.focus(input);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("applies formatDisplayValue in freeSolo mode", () => {
    render(
      <Combobox
        label="Airport"
        options={[]}
        value="syd"
        freeSolo
        formatDisplayValue={(val) => val.toUpperCase()}
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole("combobox", { name: /Airport/i });
    expect(input).toHaveValue("SYD");
  });
});
