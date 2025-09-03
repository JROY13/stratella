export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createNote } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Note } from './NotesList'
import { countOpenTasks } from '@/lib/taskparse'
import { NavButton } from '@/components/NavButton'
import { NotesClient } from './NotesClient'

export default async function NotesPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,updated_at,body')
    .order('updated_at', { ascending: false })

  const enriched: Note[] = (notes ?? []).map(n => ({
    id: n.id,
    title: n.title,
    updated_at: n.updated_at,
    openTasks: countOpenTasks(n.body || '')
  }))

  async function createBlankNote() {
    'use server'
    const id = await createNote()
    redirect(`/notes/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <form action={createBlankNote}>
          <Button type="submit">New</Button>
        </form>
        <NavButton href="/tasks" variant="outline">
          View Tasks
        </NavButton>
      </div>

      <NotesClient notes={enriched} />
    </div>
  )
}
