import { Editor } from "@tiptap/core";
import { createInlineEditorExtensions } from "../InlineEditor";
import { describe, expect, it } from "vitest";
import "./setup";

function createEditor() {
  const extensions = createInlineEditorExtensions().filter(
    (ext) => ext.name !== "dragHandle",
  );
  return new Editor({ extensions });
}

describe("getHTML serialization", () => {
  it("serializes headings and lists to HTML", () => {
    const editor = createEditor();
    editor.commands.setContent({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Heading" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Bullet" }],
                },
              ],
            },
          ],
        },
        {
          type: "orderedList",
          attrs: { start: 1 },
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const html = editor.getHTML();
    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<ul");
    expect(html).toContain("<ol");
    expect(html).toContain("<li><p>Bullet</p></li>");
    expect(html).toContain("<li><p>First</p></li>");
    editor.destroy();
  });

  it("serializes task items to HTML", () => {
    const editor = createEditor();
    editor.commands.setContent({
      type: "doc",
      content: [
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Todo" }],
                },
              ],
            },
            {
              type: "taskItem",
              attrs: { checked: true },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Done" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const html = editor.getHTML();
    expect(html).toContain('data-type="taskItem"');
    expect(html).toContain("Todo");
    expect(html).toContain("Done");
    editor.destroy();
  });
});
