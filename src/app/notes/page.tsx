export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createNote } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NotesList } from './NotesList'
import { countOpenTasks } from '@/lib/taskparse'

export default async function NotesPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,updated_at,body')
    .order('updated_at', { ascending: false })

  const enriched = (notes ?? []).map(n => ({
    id: n.id,
    title: n.title,
    updated_at: n.updated_at,
    openTasks: countOpenTasks(n.body || '')
  }))

  async function newNote(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string) || 'Untitled'
    await createNote(title)
  }

  return (
    <div className="space-y-6">
      <form action={newNote} className="flex gap-2">
        <Input name="title" placeholder="New note title…" />
        <Button type="submit">Add</Button>
      </form>

      <NotesList notes={enriched} />
    </div>
  )
}
