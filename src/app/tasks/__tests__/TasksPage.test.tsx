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
      updated_at: "2024-01-01T00:00:00Z",
      body: '<h1>Note A</h1><ul><li data-type="taskItem" data-checked="false"><div>Task 1</div></li></ul>',
    },
    {
      id: "n2",
      updated_at: "2024-01-02T00:00:00Z",
      body: '<h1>Note B</h1><ul><li data-type="taskItem" data-checked="false"><div>Task 2</div></li></ul>',
    },
  ];

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: async () => ({
    auth: { getUser: async () => ({ data: { user: {} } }) },
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: notes }),
      }),
    }),
  }),
}));

import TasksPage from "../page";

test("renders list view by default", async () => {
  params.set("view", "list");
  const { container } = render(
    await TasksPage({ searchParams: Promise.resolve({ view: "list" }) })
  );
  expect(container.querySelectorAll('[data-slot="card"]').length).toBe(1);
  expect(screen.getByText("Note A")).toBeTruthy();
  expect(screen.getByText("Note B")).toBeTruthy();
});

test("renders card view when view=card", async () => {
  params.set("view", "card");
  const { container } = render(
    await TasksPage({ searchParams: Promise.resolve({ view: "card" }) })
  );
  // outer card + two note group cards
  expect(container.querySelectorAll('[data-slot="card"]').length).toBe(3);
});
