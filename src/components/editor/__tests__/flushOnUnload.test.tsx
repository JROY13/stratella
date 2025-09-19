import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { act } from "react";
import { describe, it, expect, vi } from "vitest";
import InlineEditor, { AUTOSAVE_THROTTLE_MS } from "../InlineEditor";
import "./setup";

vi.mock("@/app/actions", () => ({
  saveNoteInline: vi
    .fn((id: string) => Promise.resolve({ id, openTasks: 0, updatedAt: null })),
  upsertNoteWithClientId: vi
    .fn(() =>
      Promise.resolve({ id: "note", openTasks: 0, updatedAt: null, title: "" }),
    ),
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
      vi.advanceTimersByTime(Math.max(AUTOSAVE_THROTTLE_MS - 100, 0));
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
      vi.advanceTimersByTime(Math.max(AUTOSAVE_THROTTLE_MS - 100, 0));
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
