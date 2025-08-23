"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export interface MobileToolbarProps {
  editor: Editor | null;
  noteId: string;
  userId: string | null;
}

export default function MobileToolbar({
  editor,
  noteId,
  userId,
}: MobileToolbarProps) {
  if (!editor) return null;

  const getBlockId = () => {
    const sel = editor.state?.selection;
    const from = sel?.$from;
    return (
      (from?.parent?.attrs && from.parent.attrs.id) ||
      (from ? String(from.before()) : null)
    );
  };

  const handleBold = () => {
    editor.chain().focus().toggleBold().run();
    track("editor.toolbar.bold", {
      note_id: noteId,
      block_id: getBlockId(),
      user_id: userId,
    });
  };

  const handleToggleTaskList = () => {
    const wasActive = editor.isActive("taskList");
    editor.chain().focus().toggleTaskList().run();
    if (!wasActive) {
      track("editor.checklist.create", {
        note_id: noteId,
        block_id: getBlockId(),
        user_id: userId,
      });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t bg-background p-2 shadow-md">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={handleBold}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleBold();
            }
          }}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }
          }}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }
          }}
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }
          }}
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }
          }}
        >
          <Heading3 className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }
          }}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }
          }}
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("taskList") ? "default" : "ghost"}
          onClick={handleToggleTaskList}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleToggleTaskList();
            }
          }}
        >
          <CheckSquare className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }
          }}
        >
          <Quote className="size-4" />
        </Button>
      </div>
    </div>
  );
}

