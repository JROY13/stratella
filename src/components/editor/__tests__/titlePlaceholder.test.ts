import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { createInlineEditorExtensions } from "../InlineEditor";
import "./setup";

describe("title placeholder", () => {
  it("shows placeholder until typing and removes on input", () => {
    const extensions = createInlineEditorExtensions().filter(
      e => e.name !== "dragHandle",
    );
    const editor = new Editor({ extensions });
    editor.commands.setContent("<h1></h1>", false, { preserveWhitespace: true });
    const heading = editor.view.dom.querySelector("h1");
    expect(heading?.getAttribute("data-placeholder")).toBe("Untitled Note");
    editor.commands.insertContent("Title");
    expect(heading?.getAttribute("data-placeholder")).toBeNull();
    editor.commands.keyboardShortcut("Enter");
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("heading");
    expect(json.content?.[1].type).toBe("paragraph");
    editor.destroy();
  });
});
