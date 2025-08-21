import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { JSDOM } from "jsdom";

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("notes")
    .select("id, body")
    .not("body", "ilike", "%<%")
    .not("body", "ilike", "%data-type=%");

  if (error) {
    throw error;
  }

  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).DOMParser = dom.window.DOMParser;
  (global as any).Node = dom.window.Node;
  (global as any).HTMLElement = dom.window.HTMLElement;
  (global as any).navigator = dom.window.navigator;

  const editor = new Editor({
    extensions: [StarterKit, TaskList, TaskItem],
  });

  const updated: string[] = [];

  for (const note of data ?? []) {
    const markdown = note.body ?? "";
    const html = await marked.parse(markdown);
    editor.commands.setContent(html, false, {
      parseOptions: { preserveWhitespace: true },
    });
    const newHtml = editor.getHTML();
    const { error: updateErr } = await supabase
      .from("notes")
      .update({ body: newHtml })
      .eq("id", note.id);

    if (updateErr) {
      console.error("Failed to update note", note.id, updateErr.message);
    } else {
      updated.push(String(note.id));
      console.log("Updated note", note.id);
    }
  }

  console.log("Migrated notes:", updated.join(", "));
  editor.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
