'use client'

import { useState, useMemo } from 'react'
import ViewSelector from '@/components/ViewSelector'
import FilterBar, { NoteFilters } from '@/components/notes/FilterBar'
import { Filter, LayoutPanelTop, LayoutGrid, List } from 'lucide-react'
import { NotesList, type Note } from './NotesList'

export function NotesClient({ notes }: { notes: Note[] }) {
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

