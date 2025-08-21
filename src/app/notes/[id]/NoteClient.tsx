'use client'

import React from 'react'
import NoteTitleInput from '@/components/NoteTitleInput'
import InlineEditor from '@/components/editor/InlineEditor'
import { Button } from '@/components/ui/button'

interface NoteClientProps {
  noteId: string
  initialTitle: string
  html: string
  created: string
  modified: string
  openTasks: number
  onDelete: () => void
}

export default function NoteClient({
  noteId,
  initialTitle,
  html,
  created,
  modified,
  openTasks,
  onDelete,
}: NoteClientProps) {
  const [title] = React.useState(initialTitle)
  return (
    <div className="space-y-4">
      <NoteTitleInput noteId={noteId} initialTitle={title} />
      <div className="text-sm text-muted-foreground">
        Created {created} • Modified {modified} • {openTasks} open tasks
      </div>
      <InlineEditor noteId={noteId} html={html} />
      <form action={onDelete}>
        <Button type="submit" variant="outline">
          Delete
        </Button>
      </form>
    </div>
  )
}
