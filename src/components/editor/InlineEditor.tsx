"use client";

import React from "react";
import { saveNoteInline, type SaveNoteInlineResult } from "@/app/actions";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/core";
import FloatingToolbar from "./FloatingToolbar";

type DOMPurifyType = (typeof import("dompurify"))["default"];
let DOMPurify: DOMPurifyType | null = null;
async function getDOMPurify(): Promise<DOMPurifyType> {
  if (!DOMPurify) {
    const mod = await import("dompurify");
    DOMPurify = mod.default;
  }
  return DOMPurify;
}

export interface InlineEditorProps {
  noteId: string;
  html: string;
  onChange?: (html: string) => void;
  onSaved?: (res: SaveNoteInlineResult) => void;
  onBlur?: () => void;
}

export const AUTOSAVE_THROTTLE_MS = 3000;

export type SaveStatus = "saving" | "saved" | "retrying";

export function saveWithRetry<T>(
  fn: () => Promise<T>,
  setStatus: (s: SaveStatus) => void,
  attemptRef: React.MutableRefObject<number>,
  retryTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  options?: { maxRetries?: number; onError?: (err: unknown) => void },
): Promise<T> {
  const { maxRetries = Infinity, onError } = options ?? {};
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      setStatus(attemptRef.current === 0 ? "saving" : "retrying");
      try {
        const res = await fn();
        attemptRef.current = 0;
        setStatus("saved");
        resolve(res);
      } catch (err) {
        console.error("saveWithRetry error", err);
        attemptRef.current += 1;
        setStatus("retrying");
        if (attemptRef.current > maxRetries) {
          onError?.(err);
          reject(err);
          return;
        }
        const delay = Math.min(1000 * 2 ** (attemptRef.current - 1), 30000);
        retryTimeoutRef.current = setTimeout(attempt, delay);
      }
    };
    void attempt();
  });
}

export function createInlineEditorExtensions() {
  const TaskItemExt = TaskItem.extend({
    addProseMirrorPlugins() {
      const name = this.name;
      return [
        new Plugin({
          key: new PluginKey("taskItemClick"),
          props: {
            handleClickOn(view, _pos, node, nodePos, event) {
              const el = event.target as HTMLElement;
              if (node.type.name === name && el.tagName === "INPUT") {
                event.preventDefault();
                const checked = !node.attrs.checked;
                view.dispatch(
                  view.state.tr.setNodeMarkup(nodePos, undefined, {
                    ...node.attrs,
                    checked,
                  }),
                );
                view.focus();
                return true;
              }
              return false;
            },
          },
        }),
      ];
    },
    addNodeView() {
      return ({ node, HTMLAttributes, getPos, editor }) => {
        const listItem = document.createElement("li");
        const checkboxWrapper = document.createElement("label");
        const checkboxStyler = document.createElement("span");
        const checkbox = document.createElement("input");
        const content = document.createElement("div");

        const updateA11Y = () => {
          checkbox.ariaLabel =
            this.options.a11y?.checkboxLabel?.(node, checkbox.checked) ||
            `Task item checkbox for ${node.textContent || "empty task item"}`;
        };

        updateA11Y();

        checkboxWrapper.contentEditable = "false";
        checkbox.type = "checkbox";
        checkbox.addEventListener("mousedown", (event) =>
          event.preventDefault(),
        );
        checkbox.addEventListener("change", (event) => {
          if (!editor.isEditable && !this.options.onReadOnlyChecked) {
            checkbox.checked = !checkbox.checked;
            return;
          }

          const { checked } = event.target as HTMLInputElement;

          if (editor.isEditable && typeof getPos === "function") {
            editor
              .chain()
              .focus(undefined, { scrollIntoView: false })
              .command(({ tr }) => {
                const position = getPos();
                if (typeof position !== "number") {
                  return false;
                }
                const currentNode = tr.doc.nodeAt(position);
                tr.setNodeMarkup(position, undefined, {
                  ...currentNode?.attrs,
                  checked,
                });
                return true;
              })
              .run();
          }

          if (!editor.isEditable && this.options.onReadOnlyChecked) {
            if (!this.options.onReadOnlyChecked(node, checked)) {
              checkbox.checked = !checkbox.checked;
            }
          }
        });

        Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
          listItem.setAttribute(key, value as string);
        });

        listItem.dataset.checked = node.attrs.checked;
        checkbox.checked = node.attrs.checked;

        checkboxWrapper.append(checkbox, checkboxStyler);

        listItem.setAttribute("data-type", this.name);
        listItem.append(checkboxWrapper, content);

        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          listItem.setAttribute(key, value as string);
        });

        return {
          dom: listItem,
          contentDOM: content,
          update: (updatedNode) => {
            if (updatedNode.type !== this.type) {
              return false;
            }
            listItem.dataset.checked = updatedNode.attrs.checked;
            checkbox.checked = updatedNode.attrs.checked;
            updateA11Y();
            return true;
          },
        };
      };
    },
  });

  const ArrowNavigation = Extension.create({
    addKeyboardShortcuts() {
      return {
        ArrowUp: () => {
          const { state, commands } = this.editor;
          const { $from } = state.selection;
          if ($from.parentOffset === 0) {
            const prevPos = Math.max(0, $from.before() - 1);
            const resolved = state.doc.resolve(prevPos);
            commands.focus(resolved.pos);
            return true;
          }
          return false;
        },
        ArrowDown: () => {
          const { state, commands } = this.editor;
          const { $from } = state.selection;
          if ($from.parentOffset === $from.parent.content.size) {
            const nextPos = Math.min(state.doc.content.size, $from.after());
            const resolved = state.doc.resolve(nextPos);
            commands.focus(resolved.pos);
            return true;
          }
          return false;
        },
      };
    },
  });

  const HeadingExit = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          const { state } = this.editor;
          const { $from } = state.selection;
          if (
            $from.parent.type.name === "heading" &&
            $from.parent.attrs.level === 1 &&
            $from.before() === 1 &&
            $from.parentOffset === $from.parent.content.size
          ) {
            const pos = $from.after();
            this.editor
              .chain()
              .insertContentAt(pos, { type: "paragraph" })
              .setTextSelection(pos + 1)
              .run();
            return true;
          }
          return false;
        },
      };
    },
  });

  return [
    StarterKit.configure({ history: {} }),
    TaskList,
    TaskItemExt,
    Placeholder.configure({
      placeholder: ({ node, pos }) =>
        node.type.name === "heading" && node.attrs.level === 1 && pos === 0
          ? "Untitled Note"
          : "",
    }),
    ArrowNavigation,
    HeadingExit,
  ];
}

export default function InlineEditor({
  noteId,
  html,
  onChange,
  onSaved,
  onBlur,
}: InlineEditorProps) {
  const editor = useEditor({
    extensions: createInlineEditorExtensions(),
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      transformPastedHTML: (html) =>
        DOMPurify ? DOMPurify.sanitize(html) : html,
    },
  });

  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    void getDOMPurify();
  }, []);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { supabaseClient } = await import("@/lib/supabase-client");
        const { data } = await supabaseClient.auth.getUser();
        setUserId(data.user?.id ?? null);
      } catch (error) {
        console.warn("Failed to capture user analytics", error);
      }
    };

    void fetchUser();
  }, []);

  React.useEffect(() => {
    if (!editor) return;
    const el = editor.view.dom as HTMLElement;
    const handlePaste = (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData("text/html");
      if (html) {
        event.preventDefault();
        void getDOMPurify().then((dp) => {
          const sanitized = dp.sanitize(html);
          editor.view.pasteHTML(sanitized);
        });
      }
    };
    el.addEventListener("paste", handlePaste);
    return () => {
      el.removeEventListener("paste", handlePaste);
    };
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    const source = html && html.trim() !== "" ? html : "<h1></h1>";

    try {
      editor.commands.setContent(source, false, { preserveWhitespace: true });
      editor.chain().focus().setTextSelection(1).run();
    } catch (err) {
      console.error("Failed to set HTML", err);
      editor.commands.setContent("", false, {
        preserveWhitespace: true,
      });
    }
  }, [editor, html]);

  const [status, setStatus] = React.useState<SaveStatus>("saved");
  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = React.useRef(0);

  const runSave = React.useCallback(
    (html: string, opts?: { sync?: boolean }) => {
      const docHtml = `<html><body>${html}</body></html>`;
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
      if (opts?.sync && navigator.sendBeacon) {
        attempts.current = 0;
        setStatus("saving");
        try {
          const data = new Blob(
            [JSON.stringify({ id: noteId, html: docHtml })],
            { type: "application/json" },
          );
          navigator.sendBeacon("/api/save-note-inline", data);
        } catch {}
        setStatus("saved");
        return Promise.resolve({ openTasks: 0, updatedAt: null });
      }
      return saveWithRetry(
        () => saveNoteInline(noteId, docHtml, { revalidate: false }),
        setStatus,
        attempts,
        retryTimeout,
      )
        .then(res => {
          onSaved?.(res);
          return res;
        })
        .catch(() => {});
    },
    [noteId, onSaved],
  );

  React.useEffect(() => {
    if (!editor) return;
    const updateHandler = () => {
      const current = editor.getHTML();
      onChange?.(current);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
        attempts.current = 0;
      }
      setStatus("saving");
      saveTimeout.current = setTimeout(() => {
        const currentHtml = editor.getHTML();
        void runSave(currentHtml);
      }, AUTOSAVE_THROTTLE_MS);
    };
    const blurHandler = () => {
      const current = editor.getHTML();
      onChange?.(current);
      onBlur?.();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
        attempts.current = 0;
      }
      void runSave(current);
    };
    editor.on("update", updateHandler);
    editor.on("blur", blurHandler);
    return () => {
      editor.off("update", updateHandler);
      editor.off("blur", blurHandler);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [editor, noteId, onChange, onBlur, runSave]);

  React.useEffect(() => {
    if (!editor) return;
    const flush = () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
        const current = editor.getHTML();
        void runSave(current, { sync: true });
      }
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveTimeout.current || status === "saving" || status === "retrying") {
        flush();
        e.preventDefault();
        e.returnValue = "Changes are still being saved.";
      }
    };
    const handlePageHide = () => {
      flush();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [editor, runSave, status]);

  return (
    <div className="space-y-1">
      {editor && (
        <FloatingToolbar editor={editor} noteId={noteId} userId={userId} />
      )}
      <div className="editor-prose prose prose-neutral dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
      <div className="text-xs text-muted-foreground text-right h-4">
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
        {status === "retrying" && "Retrying"}
      </div>
    </div>
  );
}
