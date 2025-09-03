import { describe, expect, it, vi } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import "./setup";
const AUTOSAVE_THROTTLE_MS = 3000;

describe("typing performance and autosave", () => {
  it("handles 10k-word typing with minimal autosaves", () => {
    vi.useFakeTimers();
    const saveNoteInline = vi.fn();
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    const editor = new Editor({
      extensions: [
        StarterKit.configure({ history: {} }),
        TaskList,
        TaskItem,
        Placeholder,
      ],
      onUpdate: () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveNoteInline();
        }, AUTOSAVE_THROTTLE_MS);
      },
    });

    const words = Array.from({ length: 10000 }, () => "word");
    const durations: number[] = [];

    for (let i = 0; i < words.length; i++) {
      const start = performance.now();
      editor.commands.insertContent(`${words[i]} `);
      durations.push(performance.now() - start);
      if ((i + 1) % 1000 === 0) {
        vi.advanceTimersByTime(AUTOSAVE_THROTTLE_MS + 1);
      }
    }

    vi.runAllTimers();

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    expect(avg).toBeLessThan(50);
    expect(saveNoteInline).toHaveBeenCalledTimes(10);

    vi.useRealTimers();
  }, 40000);
});
