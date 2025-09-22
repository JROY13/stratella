import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render } from "@testing-library/react";
import { vi } from "vitest";
import type { Note } from "../NotesList";

const { redirect: redirectMock } = vi.hoisted(() => ({
  redirect: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const mockCountOpenTasks = vi.fn(() => {
  throw new Error("countOpenTasks should not be called");
});
vi.mock("@/lib/taskparse", () => ({
  countOpenTasks: mockCountOpenTasks,
}));

const mockExtractTitleFromHtml = vi.fn(() => {
  throw new Error("extractTitleFromHtml should not be called");
});
vi.mock("@/lib/note", () => ({
  extractTitleFromHtml: mockExtractTitleFromHtml,
}));

let capturedNotes: Note[] | undefined;
vi.mock("../NotesClient", () => ({
  NotesClient: ({ notes }: { notes: Note[] }) => {
    capturedNotes = notes;
    return <div data-testid="notes-client" />;
  },
}));

vi.mock("@/components/NavButton", () => ({
  NavButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/components/quick-capture/QuickCaptureButton", () => ({
  QuickCaptureButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const select = vi.fn();
const order = vi.fn();
const from = vi.fn();

const supabaseMock = {
  auth: {
    getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
  },
  from: from.mockImplementation((table: string) => {
    if (table !== "notes") {
      throw new Error(`Unexpected table query: ${table}`);
    }
    return {
      select: select.mockImplementation((columns: string) => {
        if (columns !== "id,title,open_tasks,updated_at") {
          throw new Error(`Unexpected column selection: ${columns}`);
        }
        return {
          order: order.mockImplementation(() =>
            Promise.resolve({
              data: [
                {
                  id: "note-1",
                  title: "Persisted Title",
                  open_tasks: 2,
                  updated_at: "2024-04-20T00:00:00Z",
                },
              ],
            }),
          ),
        };
      }),
    };
  }),
};

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: async () => supabaseMock,
}));

import NotesPage from "../page";

test("renders using stored note metadata", async () => {
  capturedNotes = undefined;

  const view = await NotesPage();
  render(view);

  expect(from).toHaveBeenCalledWith("notes");
  expect(select).toHaveBeenCalledWith("id,title,open_tasks,updated_at");
  expect(order).toHaveBeenCalledWith("updated_at", { ascending: false });
  expect(capturedNotes).toEqual([
    {
      id: "note-1",
      title: "Persisted Title",
      updated_at: "2024-04-20T00:00:00Z",
      openTasks: 2,
      highlightTitle: null,
      highlightBody: null,
    },
  ]);
  expect(mockCountOpenTasks).not.toHaveBeenCalled();
  expect(mockExtractTitleFromHtml).not.toHaveBeenCalled();
  expect(redirectMock).not.toHaveBeenCalled();
});
