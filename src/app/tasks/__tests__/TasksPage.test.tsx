import React from "react";
(globalThis as unknown as { React: typeof React }).React = React;
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const params = new URLSearchParams();
const push = vi.fn();
const replace = vi.fn();
const prefetch = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, prefetch }),
  useSearchParams: () => params,
  usePathname: () => "/tasks",
  redirect: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  toggleTaskFromNote: vi.fn(),
  setTaskDueFromNote: vi.fn(),
}));

const notes = [
  {
    id: "n1",
    title: "Note A",
    updated_at: "2024-01-01T00:00:00Z",
    body: '<h1>Note A</h1><ul><li data-type="taskItem" data-checked="false"><div>Task 1</div></li></ul>',
  },
  {
    id: "n2",
    title: "Note B",
    updated_at: "2024-01-02T00:00:00Z",
    body: '<h1>Note B</h1><ul><li data-type="taskItem" data-checked="false"><div>Task 2</div></li></ul>',
  },
];

const taskRows = [
  {
    note_id: "n1",
    line: 0,
    text: "Task 1",
    tags: [],
    due: null,
    status: null,
    is_completed: false,
    note_title: "Note A",
    note_updated_at: "2024-01-01T00:00:00Z",
    highlight: null,
    rank: 0,
  },
  {
    note_id: "n2",
    line: 0,
    text: "Task 2",
    tags: [],
    due: null,
    status: null,
    is_completed: false,
    note_title: "Note B",
    note_updated_at: "2024-01-02T00:00:00Z",
    highlight: null,
    rank: 0,
  },
];

const supabaseMock = {
  auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
  from: (table: string) => {
    if (table === "notes") {
      return {
        select: () => ({
          order: () => Promise.resolve({ data: notes }),
        }),
      };
    }
    if (table === "note_tasks") {
      return {
        select: () => Promise.resolve({ data: [{ tags: [] }] }),
      };
    }
    return {
      select: () => Promise.resolve({ data: [] }),
    };
  },
  rpc: vi.fn(),
};

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: async () => supabaseMock,
}));

beforeEach(() => {
  (supabaseMock.rpc as vi.Mock).mockReset();
  (supabaseMock.rpc as vi.Mock).mockImplementation(async (fn: string) => {
    if (fn === "search_note_tasks") {
      return { data: taskRows, error: null };
    }
    return { data: [], error: null };
  });
  (global.fetch as unknown as vi.Mock | undefined)?.mockRestore?.();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: taskRows.map(row => ({
      noteId: row.note_id,
      line: row.line,
      text: row.text,
      tags: row.tags,
      due: row.due,
      status: row.status,
      isCompleted: row.is_completed,
      noteTitle: row.note_title,
      noteUpdatedAt: row.note_updated_at,
      highlight: row.highlight,
      rank: row.rank,
    })) }),
  }) as unknown as typeof fetch;
});

import TasksPage from "../page";

test("renders list view by default", async () => {
  params.set("view", "list");
  const { container } = render(await TasksPage({ searchParams: Promise.resolve({ view: "list" }) }));
  expect(container.querySelectorAll('[data-slot="card"]').length).toBe(1);
  expect(screen.getByText("Note A")).toBeTruthy();
  expect(screen.getByText("Note B")).toBeTruthy();
});

test("renders card view when view=card", async () => {
  params.set("view", "card");
  const { container } = render(await TasksPage({ searchParams: Promise.resolve({ view: "card" }) }));
  // outer card + two note group cards
  expect(container.querySelectorAll('[data-slot="card"]').length).toBe(3);
});

test("shows an error message when the RPC fails", async () => {
  (supabaseMock.rpc as vi.Mock).mockResolvedValueOnce({ data: null, error: new Error("rpc failed") });
  params.delete("view");
  const { container } = render(await TasksPage({ searchParams: Promise.resolve({}) }));
  expect(container.querySelectorAll('[data-slot="card"]').length).toBe(1);
  expect(screen.getByText("Unable to load tasks. Please try again.")).toBeTruthy();
});
