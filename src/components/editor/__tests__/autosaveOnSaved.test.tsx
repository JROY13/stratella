import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InlineEditor from "../InlineEditor";
import { countOpenTasks } from "@/lib/taskparse";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi.fn((id: string, html: string) =>
    Promise.resolve({
      id,
      openTasks: countOpenTasks(html),
      updatedAt: "2024-01-02T00:00:00.000Z",
    }),
  ),
  upsertNoteWithClientId: vi.fn((html: string) =>
    Promise.resolve({
      id: "note",
      openTasks: countOpenTasks(html),
      updatedAt: "2024-01-02T00:00:00.000Z",
      title: "Untitled",
    }),
  ),
}));

vi.mock("../FloatingToolbar", () => ({
  default: () => <div />,
}));

vi.mock("@/lib/supabase-client", () => ({
  supabaseClient: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  },
}));

vi.mock("tippy.js", () => {
  const tippy = () => ({ destroy: vi.fn() });
  (tippy as unknown as { default: typeof tippy }).default = tippy;
  return tippy;
});

describe("InlineEditor autosave", () => {
  it("calls onSaved with open task count", async () => {
    const onSaved = vi.fn();
    const html = `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>a</div></li></ul>`;
    const { container } = render(
      <InlineEditor noteId="note" html={html} onSaved={onSaved} />,
    );
    const editorEl = container.querySelector(".ProseMirror") as HTMLElement;
    fireEvent.focus(editorEl);
    fireEvent.blur(editorEl);

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onSaved).toHaveBeenCalledWith({
      id: "note",
      openTasks: 1,
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });
});
