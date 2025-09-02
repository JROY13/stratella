import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import DateFilterTrigger from "../DateFilterTrigger";

test("keyboard navigation selects date and closes picker", () => {
  const onChange = vi.fn();
  render(<DateFilterTrigger onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /select date/i }));
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "Enter" });
  expect(onChange).toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("Today and Tomorrow buttons set dates", () => {
  const onChange = vi.fn();
  render(<DateFilterTrigger onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /select date/i }));
  fireEvent.click(screen.getByText("Today"));
  const today = new Date().toISOString().slice(0, 10);
  expect(onChange).toHaveBeenLastCalledWith(today);
  fireEvent.click(screen.getByRole("button", { name: /select date/i }));
  fireEvent.click(screen.getByText("Tomorrow"));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  expect(onChange).toHaveBeenLastCalledWith(tomorrow.toISOString().slice(0, 10));
});

test("Clear button calls onClear and closes picker", () => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  render(<DateFilterTrigger value="2024-01-01" onChange={onChange} onClear={onClear} />);
  fireEvent.click(screen.getByRole("button", { name: /2024-01-01/ }));
  fireEvent.click(screen.getByText("Clear"));
  expect(onClear).toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
});
