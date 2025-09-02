import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import DateFilterTrigger from "../DateFilterTrigger";

test("arrow keys move focus and Enter selects", () => {
  const onChange = vi.fn();
  render(<DateFilterTrigger value="2024-01-15" onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /2024-01-15/ }));
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "Enter" });
  expect(onChange).toHaveBeenCalledWith("2024-01-16");
});

test("escape closes the popover", () => {
  const onChange = vi.fn();
  render(<DateFilterTrigger onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /select date/i }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});
