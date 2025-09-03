import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { act } from "react";
import { describe, it, expect, vi } from "vitest";
import InlineEditor, { AUTOSAVE_THROTTLE_MS } from "../InlineEditor";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi.fn(() => Promise.resolve({ openTasks: 0, updatedAt: null })),
}));

vi.mock("../FloatingToolbar", () => ({
  default: () => <div />,
}));

vi.mock("@/lib/supabase-client", () => ({
  supabaseClient: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } },
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

describe("InlineEditor unload", () => {
  it("flushes pending save with sendBeacon on pagehide", () => {
    vi.useFakeTimers();
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, writable: true });

    const { container } = render(<InlineEditor noteId="note" html="" />);
    const editorEl = container.querySelector(".ProseMirror") as HTMLElement;
    fireEvent.focus(editorEl);
    editorEl.textContent = "changed";
    fireEvent.input(editorEl);

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_THROTTLE_MS - 1000);
    });
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(sendBeacon).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("warns user on beforeunload when save pending", () => {
    vi.useFakeTimers();
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, writable: true });

    const { container } = render(<InlineEditor noteId="note" html="" />);
    const editorEl = container.querySelector(".ProseMirror") as HTMLElement;
    fireEvent.focus(editorEl);
    editorEl.textContent = "changed";
    fireEvent.input(editorEl);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const ev = new Event("beforeunload", { cancelable: true });
    act(() => {
      window.dispatchEvent(ev);
    });
    expect(ev.defaultPrevented).toBe(true);
    expect(sendBeacon).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
