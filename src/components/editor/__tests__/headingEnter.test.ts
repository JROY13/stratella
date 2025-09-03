import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { createInlineEditorExtensions } from "../InlineEditor";
import "./setup";

describe("heading Enter behavior", () => {
  it("inserts paragraph after heading", () => {
    const extensions = createInlineEditorExtensions().filter(
      e => e.name !== "dragHandle",
    );
    const editor = new Editor({ extensions });
    editor.commands.setContent("<h1>Title</h1>", false, { preserveWhitespace: true });
    const heading = editor.state.doc.firstChild;
    const end = (heading?.content.size ?? 0) + 1;
    editor.commands.setTextSelection(end);
    editor.commands.keyboardShortcut("Enter");
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("heading");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
    editor.destroy();
  });
});
