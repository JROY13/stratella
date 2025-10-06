import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TaskRow from "../TaskRow";

vi.mock("@/app/actions", () => ({
  toggleTaskFromNote: vi.fn(() => Promise.resolve()),
  setTaskDueFromNote: vi.fn(() => Promise.resolve()),
}));

test("calls toggleTaskFromNote when checkbox toggled", async () => {
  const { toggleTaskFromNote } = await import("@/app/actions");
  render(<TaskRow task={{ title: "Test", done: false }} noteId="n1" line={0} />);
  fireEvent.click(screen.getByRole("checkbox"));
  await waitFor(() => {
    expect(toggleTaskFromNote).toHaveBeenCalledWith("n1", 0);
  });
});

test("calls setTaskDueFromNote when date is selected", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-15"));
  const { setTaskDueFromNote } = await import("@/app/actions");
  render(<TaskRow task={{ title: "Test", done: false }} noteId="n1" line={0} />);
  fireEvent.click(screen.getByRole("button", { name: /set due date/i }));
  fireEvent.click(screen.getByRole("button", { name: /today/i }));
  await vi.runAllTimersAsync();
  expect(setTaskDueFromNote).toHaveBeenCalled();
  const fd = (setTaskDueFromNote as unknown as { mock: { calls: unknown[][] } }).mock
    .calls[0][2] as FormData;
  expect(fd.get("due")).toBe("2024-06-15");
  vi.useRealTimers();
});
