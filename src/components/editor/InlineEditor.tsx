'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'

export interface InlineEditorProps {
  markdown: string
  onChange?: (markdown: string) => void
}

export default function InlineEditor({ markdown, onChange }: InlineEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem, Placeholder, Markdown],
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  React.useEffect(() => {
    if (editor && markdown) {
      editor.commands.setContent(markdown)
    }
  }, [editor, markdown])

  React.useEffect(() => {
    if (!editor || !onChange) return
    const handler = () => {
      onChange(editor.storage.markdown.getMarkdown())
    }
    editor.on('update', handler)
    return () => {
      editor.off('update', handler)
    }
  }, [editor, onChange])

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}
