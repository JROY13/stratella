import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { createInlineEditorExtensions } from "../InlineEditor";
import "./setup";

describe("task item data-type attribute", () => {
  it("sets data-type on task list items", () => {
    const editor = new Editor({ extensions: createInlineEditorExtensions() });
    editor.commands.toggleTaskList();
    editor.commands.insertContent("task");
    const listItem = editor.view.dom.querySelector("li");
    expect(listItem?.getAttribute("data-type")).toBe("taskItem");
    editor.destroy();
  });
});
