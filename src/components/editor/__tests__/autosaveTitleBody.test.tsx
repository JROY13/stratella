import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi.fn((id: string) =>
    Promise.resolve({ id, openTasks: 0, updatedAt: "2024-01-02T00:00:00.000Z" })
  ),
  upsertNoteWithClientId: vi.fn(() =>
    Promise.resolve({
      id: "note",
      openTasks: 0,
      updatedAt: "2024-01-02T00:00:00.000Z",
      title: "Untitled",
    })
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
