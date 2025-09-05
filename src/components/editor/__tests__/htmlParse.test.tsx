import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InlineEditor from "../InlineEditor";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi
    .fn()
    .mockResolvedValue({ openTasks: 0, updatedAt: null }),
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

describe("InlineEditor mounts with malformed HTML", () => {
  const renderEditor = (html: string | null) => {
    expect(() =>
      render(<InlineEditor noteId="note" html={html as unknown as string} />),
    ).not.toThrow();
  };

  it("mounts with null html", () => {
    renderEditor(null);
  });

  it("mounts with invalid html", () => {
    renderEditor("<p><span");
  });
});
