'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TasksFilters from '@/components/tasks/TasksFilters'
import ViewSelector from '@/components/ViewSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TaskRow from '@/components/tasks/TaskRow'
import { useSearchParams } from 'next/navigation'
import { NavButton } from '@/components/NavButton'

type NoteOption = { id: string; title: string }

type FilterState = {
  completion?: string
  tag?: string
  due?: string
  sort?: string
  note?: string
  search?: string
}

type TaskResult = {
  noteId: string
  line: number
  text: string
  tags: string[]
  due: string | null
  status: string | null
  isCompleted: boolean
  noteTitle: string | null
  noteUpdatedAt: string
  highlight: string | null
  rank?: number
}

interface TasksClientProps {
  notes: NoteOption[]
  tags: string[]
  initialFilters: FilterState
  initialTasks: TaskResult[]
  initialError?: string | null
}

type SearchState = {
  loading: boolean
  error: string | null
}

export function TasksClient({ notes, tags, initialFilters, initialTasks, initialError }: TasksClientProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [tasks, setTasks] = useState<TaskResult[]>(initialTasks)
  const [{ loading, error }, setSearchState] = useState<SearchState>({
    loading: false,
    error: initialError ?? null,
  })
  const lastRequest = useRef<number>(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    setFilters(initialFilters)
    setTasks(initialTasks)
    setSearchState({ loading: false, error: initialError ?? null })
  }, [initialFilters, initialTasks, initialError])

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
            scope: 'tasks',
            query: filters.search ?? null,
            completion: filters.completion ?? null,
            noteId: filters.note ?? null,
            tag: filters.tag ?? null,
            due: filters.due ?? null,
            sort: filters.sort ?? 'text',
            page: 1,
            pageSize: 200,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`Task search failed with status ${res.status}`)
        }

        const data = (await res.json()) as {
          results: Array<Partial<TaskResult>>
        }

        if (lastRequest.current === requestId) {
          const mapped = (data.results ?? [])
            .filter(result => Boolean(result.noteId))
            .map(result => ({
              noteId: result.noteId as string,
              line: Number.isFinite(Number(result.line)) ? Number(result.line) : 0,
              text: (result.text as string | undefined) ?? '',
              tags: (result.tags as string[] | undefined) ?? [],
              due: (result.due as string | null | undefined) ?? null,
              status: (result.status as string | null | undefined) ?? null,
              isCompleted: Boolean(result.isCompleted),
              noteTitle: (result.noteTitle as string | null | undefined) ?? null,
              noteUpdatedAt: (result.noteUpdatedAt as string | undefined) ?? new Date().toISOString(),
              highlight: (result.highlight as string | null | undefined) ?? null,
              rank: Number(result.rank ?? 0),
            }))
          setTasks(mapped)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.error(err)
        if (lastRequest.current === requestId) {
          setSearchState({ loading: false, error: 'Unable to load tasks. Please try again.' })
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

  const groups = useMemo(() => {
    const collection = new Map<string, { id: string; title: string; updatedAt: string; tasks: TaskResult[] }>()
    tasks.forEach(task => {
      const title =
        task.noteTitle && task.noteTitle.trim()
          ? task.noteTitle
          : notes.find(n => n.id === task.noteId)?.title || 'Untitled'
      if (!collection.has(task.noteId)) {
        collection.set(task.noteId, { id: task.noteId, title, updatedAt: task.noteUpdatedAt, tasks: [] })
      }
      collection.get(task.noteId)!.tasks.push(task)
    })
    return Array.from(collection.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [tasks, notes])

  const view = useMemo(() => {
    const value = searchParams.get('view')
    return value === 'card' ? 'card' : 'list'
  }, [searchParams])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading tasks…'
    if (error) return error
    if (filters.completion === 'done') return 'No closed tasks'
    if (filters.search) return 'No tasks matched your search'
    return 'No tasks found'
  }, [loading, error, filters.completion, filters.search])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TasksFilters
          notes={notes}
          tags={tags}
          onFiltersChange={next => setFilters({ ...next })}
        >
          <ViewSelector
            defaultValue="list"
            options={[
              { value: 'list', label: 'List', icon: 'list' },
              { value: 'card', label: 'Card', icon: 'card' },
            ]}
          />
        </TasksFilters>
        {error && groups.length > 0 && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {groups.length === 0 ? (
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {emptyMessage}
          </p>
        ) : view === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2" aria-busy={loading}>
            {groups.map(group => (
              <Card key={group.id} className="hover:shadow-sm transition w-full">
                <CardHeader>
                  <CardTitle>
                    <NavButton
                      href={`/notes/${group.id}`}
                      variant="link"
                      className="p-0 h-auto font-medium underline"
                    >
                      <span className="truncate block max-w-[12rem]">
                        {group.title}
                      </span>
                    </NavButton>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {group.tasks.map(task => (
                      <TaskRow
                        key={`${group.id}-${task.line}`}
                        task={{ title: task.text, done: task.isCompleted, due: task.due ?? undefined, highlight: task.highlight ?? undefined }}
                        noteId={group.id}
                        line={task.line}
                      />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6" aria-busy={loading}>
            {groups.map(group => (
              <div key={group.id}>
                <NavButton
                  href={`/notes/${group.id}`}
                  variant="link"
                  className="p-0 h-auto font-medium underline"
                >
                  {group.title}
                </NavButton>
                <ul className="mt-2 space-y-2">
                  {group.tasks.map(task => (
                    <TaskRow
                      key={`${group.id}-${task.line}`}
                      task={{ title: task.text, done: task.isCompleted, due: task.due ?? undefined, highlight: task.highlight ?? undefined }}
                      noteId={group.id}
                      line={task.line}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TasksClient
