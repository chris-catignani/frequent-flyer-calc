import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dialog } from "./dialog";

describe("Dialog Primitive", () => {
  it("does not render when open is false", () => {
    render(
      <Dialog open={false} onClose={jest.fn()}>
        <div>Dialog Content</div>
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open is true and handles backdrop click to close", () => {
    const onClose = jest.fn();
    render(
      <Dialog open={true} onClose={onClose} title="Test Dialog">
        <div>Dialog Content</div>
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog Content")).toBeInTheDocument();

    const backdrop = screen.getByTestId("dialog-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape key press", () => {
    const onClose = jest.fn();
    render(
      <Dialog open={true} onClose={onClose}>
        <div>Dialog Content</div>
      </Dialog>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
