import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InlineEditor from "../InlineEditor";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi
    .fn((id: string) =>
      Promise.resolve({ id, openTasks: 0, updatedAt: null }),
    ),
  upsertNoteWithClientId: vi
    .fn(() => Promise.resolve({ id: "note", openTasks: 0, updatedAt: null, title: "" })),
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

describe("InlineEditor initialization", () => {
  const renderEditor = (html: string | null) => {
    expect(() =>
      render(<InlineEditor noteId="note" html={html as unknown as string} />),
    ).not.toThrow();
  };

  it("initializes with null html", () => {
    renderEditor(null);
  });

  it("initializes with empty html", () => {
    renderEditor("");
  });

  it("initializes with invalid html", () => {
    renderEditor("<p><span");
  });
});
