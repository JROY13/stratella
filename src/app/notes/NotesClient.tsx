'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ViewSelector from '@/components/ViewSelector'
import FilterBar, { NoteFilters } from '@/components/notes/FilterBar'
import { Filter } from 'lucide-react'
import { NotesList, type Note } from './NotesList'

type SearchState = {
  loading: boolean
  error: string | null
}

export function NotesClient({ notes }: { notes: Note[] }) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<NoteFilters>({ sort: 'newest' })
  const [results, setResults] = useState<Note[]>(notes)
  const [{ loading, error }, setSearchState] = useState<SearchState>({ loading: false, error: null })
  const lastRequest = useRef<number>(0)

  useEffect(() => {
    setResults(notes)
    setSearchState({ loading: false, error: null })
  }, [notes])

  useEffect(() => {
    const requestId = Date.now()
    lastRequest.current = requestId

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setSearchState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scope: 'notes',
            query: filters.search ?? null,
            sort: filters.sort,
            page: 1,
            pageSize: 50,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`)
        }

        const data = (await res.json()) as {
          results: Array<Partial<Note> & { updatedAt?: string }>
        }

        if (lastRequest.current === requestId) {
          const mapped = (data.results ?? [])
            .filter(result => Boolean(result.id))
            .map(result => ({
              id: result.id as string,
              title: (result.title as string | undefined) ?? '',
              updated_at: (result.updatedAt as string | undefined) ?? new Date().toISOString(),
              openTasks: Number(result.openTasks ?? 0),
              highlightTitle: (result.highlightTitle as string | null | undefined) ?? null,
              highlightBody: (result.highlightBody as string | null | undefined) ?? null,
              rank: Number(result.rank ?? 0),
            }))
          setResults(mapped)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.error(err)
        if (lastRequest.current === requestId) {
          setSearchState({ loading: false, error: 'Unable to load notes. Please try again.' })
        }
        return
      }

      if (lastRequest.current === requestId) {
        setSearchState({ loading: false, error: null })
      }
    }, filters.search ? 250 : 0)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [filters])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading notes…'
    if (error) return error
    return filters.search ? 'No matching notes found' : 'No notes available'
  }, [loading, error, filters.search])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ViewSelector
          defaultValue="card"
          options={[
            { value: 'card', label: 'Card', icon: 'card' },
            { value: 'grid', label: 'Grid', icon: 'grid' },
            { value: 'list', label: 'List', icon: 'list' },
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
      {error && results.length > 0 && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {emptyMessage}
        </p>
      ) : (
        <NotesList notes={results} loading={loading} />
      )}
    </div>
  )
}

