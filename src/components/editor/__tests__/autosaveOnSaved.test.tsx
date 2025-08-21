import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InlineEditor from "../InlineEditor";
import { countOpenTasks } from "@/lib/taskparse";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi.fn((_: string, html: string) =>
    Promise.resolve({
      openTasks: countOpenTasks(html),
      updatedAt: "2024-01-02T00:00:00.000Z",
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

vi.mock("@tiptap/extension-drag-handle", async () => {
  const actual = await vi.importActual<typeof import("@tiptap/core")>("@tiptap/core");
  return { default: actual.Extension.create({ name: "dragHandle" }) };
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
      openTasks: 1,
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });
});
