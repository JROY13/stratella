export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createNote } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NotesList, Note } from './NotesList'
import { countOpenTasks } from '@/lib/taskparse'
import { NavButton } from '@/components/NavButton'
import ViewSelector from '@/components/ViewSelector'
import FilterBar, { NoteFilters } from '@/components/notes/FilterBar'
import { Filter, LayoutPanelTop, LayoutGrid, List } from 'lucide-react'
import { useState, useMemo } from 'react'

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
      <div className="flex gap-2">
        <form action={newNote} className="flex gap-2 flex-1">
          <Input name="title" placeholder="New note title…" />
          <Button type="submit">Add</Button>
        </form>
        <NavButton href="/tasks" variant="outline">
          View Tasks
        </NavButton>
      </div>

      <NotesClient notes={enriched} />
    </div>
  )
}

export function NotesClient({ notes }: { notes: Note[] }) {
  'use client'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<NoteFilters>({ sort: 'newest' })

  const filtered = useMemo(() => {
    let res = [...notes]
    if (filters.search) {
      const s = filters.search.toLowerCase()
      res = res.filter(n => n.title?.toLowerCase().includes(s))
    }
    res.sort((a, b) => {
      const diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      return filters.sort === 'oldest' ? diff : -diff
    })
    return res
  }, [notes, filters])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ViewSelector
          defaultValue="card"
          options={[
            { value: 'card', label: 'Card', icon: LayoutPanelTop },
            { value: 'grid', label: 'Grid', icon: LayoutGrid },
            { value: 'list', label: 'List', icon: List },
          ]}
        />
        <button
          type="button"
          aria-label="Toggle filters"
          onClick={() => setShowFilters(s => !s)}
          className="rounded-md border border-input p-2 hover:bg-accent/50"
        >
          <Filter className="size-4" />
        </button>
      </div>
      {showFilters && <FilterBar onChange={setFilters} />}
      <NotesList notes={filtered} />
    </div>
  )
}
