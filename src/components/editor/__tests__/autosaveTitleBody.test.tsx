import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi.fn(() =>
    Promise.resolve({ openTasks: 0, updatedAt: "2024-01-02T00:00:00.000Z" })
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

import InlineEditor from "../InlineEditor";
import { saveNoteInline } from "@/app/actions";

describe("InlineEditor autosave", () => {
  it("saves title and body together", async () => {
    const { container } = render(
      <InlineEditor noteId="note" html="<h1>Title</h1><p>Body</p>" />,
    );
    const editorEl = container.querySelector(".ProseMirror") as HTMLElement;
    fireEvent.focus(editorEl);
    fireEvent.blur(editorEl);
    await waitFor(() => expect(saveNoteInline).toHaveBeenCalled());
    expect(saveNoteInline.mock.calls[0][1]).toContain(
      "<h1>Title</h1><p>Body</p>",
    );
  });
});
