'use client'

import { useState } from 'react'
import ViewSelector from '@/components/ViewSelector'
import TasksFilterBar from './TasksFilterBar'
import { Filter, LayoutPanelTop, List } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TaskFilters } from '@/lib/taskparse'

type NoteOption = { id: string; title: string }

interface TasksFiltersProps {
  notes: NoteOption[]
  tags: string[]
}

interface FilterState extends TaskFilters {
  note?: string
}

export default function TasksFilters({ notes, tags }: TasksFiltersProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleApply(filters: FilterState) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center gap-2">
        <ViewSelector
          defaultValue="list"
          options={[
            { value: 'list', label: 'List', icon: List },
            { value: 'card', label: 'Card', icon: LayoutPanelTop },
          ]}
        />
        <button
          type="button"
          aria-label="Toggle filters"
          onClick={() => setOpen(o => !o)}
          className="rounded-md border border-input p-2 hover:bg-accent/50"
        >
          <Filter className="size-4" />
        </button>
      </div>
      {open && (
        <TasksFilterBar
          notes={notes}
          tags={tags}
          onChange={() => {}}
          onApply={handleApply}
        />
      )}
    </div>
  )
}

