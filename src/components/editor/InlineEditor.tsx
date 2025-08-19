'use client'

import React from 'react'
import { saveNoteInline } from '@/app/actions'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface InlineEditorProps {
  noteId: string
  markdown: string
  onChange?: (markdown: string) => void
}

export default function InlineEditor({ noteId, markdown, onChange }: InlineEditorProps) {
  const TaskItemExt = TaskItem.extend({
    addProseMirrorPlugins() {
      const name = this.name
      return [
        new Plugin({
          key: new PluginKey('taskItemClick'),
          props: {
            handleClickOn(view, _pos, node, nodePos, event) {
              const el = event.target as HTMLElement
              if (node.type.name === name && el.tagName === 'INPUT') {
                event.preventDefault()
                const checked = !node.attrs.checked
                view.dispatch(
                  view.state.tr.setNodeMarkup(nodePos, undefined, { ...node.attrs, checked })
                )
                view.focus()
                return true
              }
              return false
            },
          },
        }),
      ]
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: {} }),
      TaskList,
      TaskItemExt,
      Placeholder,
      Markdown,
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  React.useEffect(() => {
    if (!editor) return
    const doc = editor.storage.markdown.parse(markdown)
    editor.commands.setContent(doc)
  }, [editor, markdown])

  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (!editor) return
    const updateHandler = () => {
      const md = editor.storage.markdown.getMarkdown()
      onChange?.(md)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        saveNoteInline(noteId, md)
      }, 2000)
    }
    const blurHandler = () => {
      const md = editor.storage.markdown.getMarkdown()
      onChange?.(md)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveNoteInline(noteId, md)
    }
    editor.on('update', updateHandler)
    editor.on('blur', blurHandler)
    return () => {
      editor.off('update', updateHandler)
      editor.off('blur', blurHandler)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [editor, noteId, onChange])

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}
