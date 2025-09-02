import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import TaskRow from "../TaskRow";

function Wrapper() {
  const [task, setTask] = React.useState({ title: "Test", done: false });
  return (
    <TaskRow
      task={task}
      onToggle={() => {}}
      onDueChange={due => setTask(t => ({ ...t, due }))}
    />
  );
}

test("link label updates when date is set and cleared", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-15"));
  render(<Wrapper />);

  fireEvent.click(screen.getByRole("button", { name: /set due date/i }));
  fireEvent.click(screen.getByRole("button", { name: /today/i }));
  const expected = new Date("2024-06-15").toLocaleDateString();
  expect(screen.getByRole("button", { name: expected })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: expected }));
  fireEvent.click(screen.getByRole("button", { name: /clear/i }));
  expect(screen.getByRole("button", { name: /set due date/i })).toBeTruthy();
  vi.useRealTimers();
});
