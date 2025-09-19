export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Note } from './NotesList'
import { countOpenTasks } from '@/lib/taskparse'
import { NavButton } from '@/components/NavButton'
import { NotesClient } from './NotesClient'
import { extractTitleFromHtml } from '@/lib/note'
import { QuickCaptureButton } from '@/components/quick-capture/QuickCaptureButton'

const EMPTY_HTML = '<h1></h1>'

export default async function NotesPage() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,updated_at,body')
    .order('updated_at', { ascending: false })

  const enriched: Note[] = (notes ?? [])
    .filter(n => {
      const body = (n.body ?? '').trim()
      return body !== '' && body !== EMPTY_HTML
    })
    .map(n => ({
      id: n.id,
      title: extractTitleFromHtml(n.body),
      updated_at: n.updated_at,
      openTasks: countOpenTasks(n.body || ''),
      highlightTitle: null,
      highlightBody: null,
    }))

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
