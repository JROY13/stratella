import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  global.fetch = vi.fn(async (_input, init) => {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const query = body.query as string | undefined

    const payload = query
      ? {
          results: notes
            .filter(note => note.title.toLowerCase().includes(query.toLowerCase()))
            .map(n => ({ ...n, updatedAt: n.updated_at })),
        }
      : {
          results: notes.map(n => ({ ...n, updatedAt: n.updated_at })),
        }

    return okResponse(payload) as unknown as Response
  }) as unknown as typeof fetch
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

  expect(screen.getByText("Alpha")).toBeTruthy();
  expect(screen.getByText("Beta")).toBeTruthy();

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
    expect((global.fetch as unknown as vi.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  });
  await waitFor(() => {
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.queryByText("Beta")).toBeNull();
  });

  // Clear search and sort oldest
  const fetchCallsAfterSearch = (global.fetch as unknown as vi.Mock).mock.calls.length;
  await act(async () => {
    fireEvent.change(search, { target: { value: "" } });
  });
  await waitFor(() => {
    const noteLinks = screen.getAllByRole("link", { name: /Updated/ });
    expect(noteLinks).toHaveLength(notes.length);
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
  });
  expect((global.fetch as unknown as vi.Mock).mock.calls.length).toBe(fetchCallsAfterSearch);

  const select = screen.getByLabelText("Sort notes") as HTMLSelectElement;
  await act(async () => {
    fireEvent.change(select, { target: { value: "oldest" } });
  });
  await waitFor(() => {
    const noteLinks = screen.getAllByRole("link", { name: /Updated/ });
    const titles = noteLinks.map(link => within(link).getByText(/Alpha|Beta/).textContent?.trim());
    expect(titles).toEqual(["Beta", "Alpha"]);
  });
  expect((global.fetch as unknown as vi.Mock).mock.calls.length).toBe(fetchCallsAfterSearch);
});
