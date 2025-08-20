'use client'

import React from 'react'
import { saveNoteInline } from '@/app/actions'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import DragHandle from '@tiptap/extension-drag-handle'
import DOMPurify from 'dompurify'
import { Extension } from '@tiptap/core'
import FloatingToolbar from './FloatingToolbar'

export interface InlineEditorProps {
  noteId: string
  markdown: string
  onChange?: (markdown: string) => void
}

export const AUTOSAVE_THROTTLE_MS = 3000

export type SaveStatus = 'saving' | 'saved' | 'retrying'

export function saveWithRetry(
  fn: () => Promise<void>,
  setStatus: (s: SaveStatus) => void,
  attemptRef: React.MutableRefObject<number>,
  retryTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
): Promise<void> {
  return new Promise(resolve => {
    const attempt = async () => {
      setStatus(attemptRef.current === 0 ? 'saving' : 'retrying')
      try {
        await fn()
        attemptRef.current = 0
        setStatus('saved')
        resolve()
      } catch {
        attemptRef.current += 1
        setStatus('retrying')
        const delay = Math.min(1000 * 2 ** (attemptRef.current - 1), 30000)
        retryTimeoutRef.current = setTimeout(attempt, delay)
      }
    }
    attempt()
  })
}

export function createInlineEditorExtensions() {
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

  const ListItemExt = ListItem.extend({
    addKeyboardShortcuts() {
      return {
        ...this.parent?.(),
        Enter: () => {
          if (!this.editor.isActive('listItem')) {
            return false
          }

          const { $from } = this.editor.state.selection
          const isEmpty = $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0

          if (isEmpty) {
            return this.editor.commands.liftListItem(this.name)
          }

          return this.editor.commands.splitListItem(this.name)
        },
        Backspace: () => {
          const { selection } = this.editor.state
          const { $from, empty } = selection

          if (!empty || !$from.parentOffset || !this.editor.isActive('listItem')) {
            return false
          }

          return this.editor.commands.liftListItem(this.name)
        },
      }
    },
  })

  const ArrowNavigation = Extension.create({
    addKeyboardShortcuts() {
      return {
        ArrowUp: () => {
          const { state, commands } = this.editor
          const { $from } = state.selection
          if ($from.parentOffset === 0) {
            const prevPos = Math.max(0, $from.before() - 1)
            const resolved = state.doc.resolve(prevPos)
            commands.focus(resolved.pos)
            return true
          }
          return false
        },
        ArrowDown: () => {
          const { state, commands } = this.editor
          const { $from } = state.selection
          if ($from.parentOffset === $from.parent.content.size) {
            const nextPos = Math.min(state.doc.content.size, $from.after())
            const resolved = state.doc.resolve(nextPos)
            commands.focus(resolved.pos)
            return true
          }
          return false
        },
      }
    },
  })

  return [
    StarterKit.configure({ history: {}, listItem: false }),
    ListItemExt,
    TaskList,
    TaskItemExt,
    Placeholder,
    Markdown.configure({
      html: false,
      transformPastedText: true, // enables markdown parser with escape support
    }),
    DragHandle,
    ArrowNavigation,
  ]
}

export default function InlineEditor({ noteId, markdown, onChange }: InlineEditorProps) {
  const editor = useEditor({
    extensions: createInlineEditorExtensions(),
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
      transformPastedHTML: (html) => DOMPurify.sanitize(html),
    },
  })

  const [userId, setUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { supabaseClient } = await import('@/lib/supabase-client')
        const { data } = await supabaseClient.auth.getUser()
        setUserId(data.user?.id ?? null)
      } catch (error) {
        console.warn('Failed to capture user analytics', error)
      }
    }

    void fetchUser()
  }, [])

  React.useEffect(() => {
    if (!editor) return
    const el = editor.view.dom as HTMLElement
    const handlePaste = (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData('text/html')
      if (html) {
        event.preventDefault()
        const sanitized = DOMPurify.sanitize(html)
        editor.view.pasteHTML(sanitized)
      }
    }
    el.addEventListener('paste', handlePaste)
    return () => {
      el.removeEventListener('paste', handlePaste)
    }
  }, [editor])

  React.useEffect(() => {
    if (!editor) return
    const doc = editor.storage.markdown.parse(markdown)
    editor.commands.setContent(doc)
  }, [editor, markdown])

  const [status, setStatus] = React.useState<SaveStatus>('saved')
  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const attempts = React.useRef(0)

  const runSave = React.useCallback((md: string) => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current)
      retryTimeout.current = null
    }
    saveWithRetry(() => saveNoteInline(noteId, md), setStatus, attempts, retryTimeout)
  }, [noteId])

  React.useEffect(() => {
    if (!editor) return
    const updateHandler = () => {
      const md = editor.storage.markdown.getMarkdown()
      onChange?.(md)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current)
        retryTimeout.current = null
        attempts.current = 0
      }
      setStatus('saving')
      saveTimeout.current = setTimeout(() => {
        const currentMd = editor.storage.markdown.getMarkdown()
        runSave(currentMd)
      }, AUTOSAVE_THROTTLE_MS)
    }
    const blurHandler = () => {
      const md = editor.storage.markdown.getMarkdown()
      onChange?.(md)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current)
        retryTimeout.current = null
        attempts.current = 0
      }
      runSave(md)
    }
    editor.on('update', updateHandler)
    editor.on('blur', blurHandler)
    return () => {
      editor.off('update', updateHandler)
      editor.off('blur', blurHandler)
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      if (retryTimeout.current) clearTimeout(retryTimeout.current)
    }
  }, [editor, noteId, onChange, runSave])

  return (
    <div className="space-y-1">
      {editor && (
        <FloatingToolbar editor={editor} noteId={noteId} userId={userId} />
      )}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
      <div className="text-xs text-muted-foreground text-right h-4">
        {status === 'saving' && 'Saving…'}
        {status === 'saved' && 'Saved'}
        {status === 'retrying' && 'Retrying'}
      </div>
    </div>
  )
}
