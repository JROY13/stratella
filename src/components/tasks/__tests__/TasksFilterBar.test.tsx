import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
const params = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => params,
}));
interface DateFilterProps {
  onChange: (date: string | undefined) => void;
  value?: string;
  onClear: () => void;
}
vi.mock("../DateFilterTrigger", () => ({
  default: ({ onChange, value, onClear }: DateFilterProps) => (
    <div>
      <button onClick={() => onChange("2024-01-01")}>set-date</button>
      {value && <button onClick={onClear}>clear-date</button>}
    </div>
  ),
}));
import TasksFilterBar from "../TasksFilterBar";

test("each control updates filters and pills", () => {
  const onChange = vi.fn();
  render(
    <TasksFilterBar
      notes={[{ id: "1", title: "Note 1" }]}
      tags={["tag1"]}
      onChange={onChange}
    />
  );

  const selects = screen.getAllByRole("combobox");
  const [completionSelect, noteSelect, tagSelect, sortSelect] = selects;

  fireEvent.change(completionSelect, { target: { value: "done" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ completion: "done" }));
  expect(screen.getByText("Done", { selector: "span" })).toBeTruthy();

  fireEvent.change(noteSelect, { target: { value: "1" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ note: "1" }));
  expect(screen.getByText("Note 1", { selector: "span" })).toBeTruthy();

  fireEvent.change(tagSelect, { target: { value: "tag1" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ tag: "tag1" }));
  expect(screen.getByText("#tag1", { selector: "span" })).toBeTruthy();

  fireEvent.click(screen.getByText("set-date"));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ due: "2024-01-01" }));
  expect(screen.getByText("2024-01-01")).toBeTruthy();

  fireEvent.change(sortSelect, { target: { value: "due" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "due" }));
  expect(screen.getByText("Sort due")).toBeTruthy();

  fireEvent.click(screen.getByLabelText("Clear completion filter"));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ completion: undefined }));
  expect(screen.queryByText("Done", { selector: "span" })).toBeNull();
});
