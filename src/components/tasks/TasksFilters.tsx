'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import TasksFilterBar from './TasksFilterBar'
import FiltersOverlay from './FiltersOverlay'
import type { TaskFilters } from '@/lib/taskparse'

export default function TasksFilters({
  notes,
  tags,
}: {
  notes: { id: string; title: string }[]
  tags: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  type FilterState = TaskFilters & { note?: string }

  function apply(filters: FilterState) {
    const params = new URLSearchParams()
    if (filters.completion) params.set('completion', filters.completion)
    if (filters.note) params.set('note', filters.note)
    if (filters.tag) params.set('tag', filters.tag)
    if (filters.due) params.set('due', filters.due)
    if (filters.sort) params.set('sort', filters.sort)
    const query = params.toString()
    if (query === searchParams.toString()) return
    router.push(query ? `/tasks?${query}` : '/tasks')
  }

  const initialFilters: FilterState = {
    completion: searchParams.get('completion') ?? undefined,
    note: searchParams.get('note') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    due: searchParams.get('due') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <TasksFilterBar notes={notes} tags={tags} onChange={apply} />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Filters...
        </Button>
      </div>
      <FiltersOverlay
        open={open}
        onClose={() => setOpen(false)}
        notes={notes}
        tags={tags}
        initialFilters={initialFilters}
        onApply={apply}
      />
    </>
  )
}
