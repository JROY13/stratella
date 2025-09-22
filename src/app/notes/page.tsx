export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { Note } from './NotesList'
import { NavButton } from '@/components/NavButton'
import { NotesClient } from './NotesClient'
import { QuickCaptureButton } from '@/components/quick-capture/QuickCaptureButton'

type NoteRow = {
  id: string
  title: string | null
  open_tasks: number | string | null
  updated_at: string
}

function parseOpenTasks(value: NoteRow['open_tasks']): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed !== '') {
      const parsed = Number(trimmed)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return 0
}

export default async function NotesPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,open_tasks,updated_at')
    .order('updated_at', { ascending: false })

  const enriched: Note[] = ((notes ?? []) as NoteRow[])
    .map(note => {
      const title = note.title ?? ''
      const openTasks = parseOpenTasks(note.open_tasks)

      return {
        id: note.id,
        title,
        updated_at: note.updated_at,
        openTasks,
        highlightTitle: null,
        highlightBody: null,
      }
    })
    .filter(note => note.title.trim() !== '' || note.openTasks > 0)

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <QuickCaptureButton>Quick capture</QuickCaptureButton>
        <NavButton href="/tasks" variant="outline">
          View Tasks
        </NavButton>
      </div>

      <NotesClient notes={enriched} />
    </div>
  )
}
