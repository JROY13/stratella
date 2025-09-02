import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

const replace = vi.fn();
const params = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/notes",
  useSearchParams: () => params,
}));

import { NotesClient } from "../page";

const notes = [
  { id: "1", title: "Alpha", updated_at: "2024-01-02T00:00:00Z", openTasks: 0 },
  { id: "2", title: "Beta", updated_at: "2024-01-01T00:00:00Z", openTasks: 0 },
];

test("filter bar toggles and filters notes", () => {
  render(<NotesClient notes={notes} />);

  // Initially hidden
  expect(screen.queryByPlaceholderText("Search title…")).toBeNull();

  // Toggle filter bar
  fireEvent.click(screen.getByLabelText("Toggle filters"));
  const search = screen.getByPlaceholderText("Search title…");
  expect(search).toBeTruthy();

  // Search filter
  fireEvent.change(search, { target: { value: "Alpha" } });
  expect(screen.getByText("Alpha")).toBeTruthy();
  expect(screen.queryByText("Beta")).toBeNull();

  // Sort oldest
  fireEvent.change(search, { target: { value: "" } });
  const select = screen.getByLabelText("Sort notes") as HTMLSelectElement;
  fireEvent.change(select, { target: { value: "oldest" } });
  const links = screen.getAllByRole("link");
  expect(links[0].textContent).toContain("Beta");
});
