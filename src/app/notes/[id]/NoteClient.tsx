'use client'

import React from 'react'
import InlineEditor from '@/components/editor/InlineEditor'
import { Button } from '@/components/ui/button'
import { NavButton } from '@/components/NavButton'
import { ArrowLeft } from 'lucide-react'

const EMPTY_HTML = '<h1></h1>'

interface NoteClientProps {
  noteId: string
  html: string
  created: string
  modified: string
  openTasks: number
  onDelete: () => void
}

export default function NoteClient({
  noteId,
  html,
  created,
  modified,
  openTasks,
  onDelete,
}: NoteClientProps) {
  const [modifiedState, setModifiedState] = React.useState(modified)
  const [openTasksState, setOpenTasksState] = React.useState(openTasks)
  const [deleting, setDeleting] = React.useState(false)

  const contentRef = React.useRef(html)
  const hasTypedRef = React.useRef(html !== EMPTY_HTML)

  const maybeDelete = React.useCallback(() => {
    if (!hasTypedRef.current && contentRef.current === EMPTY_HTML && !deleting) {
      setDeleting(true)
      void onDelete()
    }
  }, [deleting, onDelete])

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasTypedRef.current && contentRef.current === EMPTY_HTML) {
        void onDelete()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [onDelete])
  return (
    <div className="max-w-screen-md mx-auto px-4 space-y-4 relative z-0">
      <NavButton
        href="/notes"
        variant="ghost"
        size="icon"
        aria-label="Go back"
        className="md:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </NavButton>
      <InlineEditor
        noteId={noteId}
        html={html}
        onChange={next => {
          contentRef.current = next
          if (next !== EMPTY_HTML) {
            hasTypedRef.current = true
          }
        }}
        onBlur={maybeDelete}
        onSaved={({ openTasks, updatedAt }) => {
          setOpenTasksState(openTasks)
          if (updatedAt) {
            setModifiedState(new Date(updatedAt).toLocaleDateString())
          }
        }}
      />
      <div className="text-sm text-muted-foreground">
        Created {created} • Modified {modifiedState} • {openTasksState} open tasks
      </div>
      <form
        action={onDelete}
        onSubmit={() => {
          setDeleting(true)
          console.log('[delete-note]', noteId)
        }}
      >
        <Button type="submit" variant="outline" disabled={deleting}>
          Delete
        </Button>
      </form>
    </div>
  )
}
