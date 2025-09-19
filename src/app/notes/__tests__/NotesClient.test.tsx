import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const replace = vi.fn();
const params = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/notes",
  useSearchParams: () => params,
}));

import { NotesClient } from "../NotesClient";

const notes = [
  { id: "1", title: "Alpha", updated_at: "2024-01-02T00:00:00Z", openTasks: 0 },
  { id: "2", title: "Beta", updated_at: "2024-01-01T00:00:00Z", openTasks: 0 },
];

beforeEach(() => {
  const okResponse = (payload: unknown) => ({ ok: true, json: async () => payload })

  global.fetch = vi
    .fn()
    .mockResolvedValueOnce(okResponse({
      results: notes.map(n => ({ ...n, updatedAt: n.updated_at })),
    }))
    .mockResolvedValueOnce(okResponse({
      results: [notes[0]].map(n => ({ ...n, updatedAt: n.updated_at })),
    }))
    .mockResolvedValueOnce(okResponse({
      results: notes.map(n => ({ ...n, updatedAt: n.updated_at })),
    }))
    .mockResolvedValueOnce(okResponse({
      results: [...notes]
        .reverse()
        .map(n => ({ ...n, updatedAt: n.updated_at })),
    })) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
  // @ts-expect-error reset mocked fetch
  delete global.fetch;
});

test("filter bar toggles and filters notes", async () => {
  await act(async () => {
    render(<NotesClient notes={notes} />);
  });

  // Initially hidden
  expect(screen.queryByPlaceholderText("Search title…")).toBeNull();

  // Toggle filter bar
  await act(async () => {
    fireEvent.click(screen.getByLabelText("Toggle filters"));
  });
  const search = screen.getByPlaceholderText("Search title…");
  expect(search).toBeTruthy();

  // Search filter triggers server fetch
  await act(async () => {
    fireEvent.change(search, { target: { value: "Alpha" } });
  });
  await waitFor(() => {
    expect((global.fetch as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  await waitFor(() => {
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.queryByText("Beta")).toBeNull();
  });

  // Clear search and sort oldest
  await act(async () => {
    fireEvent.change(search, { target: { value: "" } });
  });
  const select = screen.getByLabelText("Sort notes") as HTMLSelectElement;
  await act(async () => {
    fireEvent.change(select, { target: { value: "oldest" } });
  });
  await waitFor(() => {
    const calls = (global.fetch as unknown as vi.Mock).mock.calls;
    const [, options] = calls[calls.length - 1];
    expect(JSON.parse(options.body as string)).toMatchObject({ scope: "notes", sort: "oldest" });
  });
});
