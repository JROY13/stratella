'use client'

import React from 'react'
import InlineEditor from '@/components/editor/InlineEditor'
import { Button } from '@/components/ui/button'
import { NavButton } from '@/components/NavButton'
import { ArrowLeft } from 'lucide-react'

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
  return (
    <div className="space-y-4 relative z-0">
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
