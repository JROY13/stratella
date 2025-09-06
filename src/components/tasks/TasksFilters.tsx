'use client'

import { useState, type ReactNode } from 'react'
import TasksFilterBar from './TasksFilterBar'
import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TaskFilters } from '@/lib/taskparse'

type NoteOption = { id: string; title: string }

interface TasksFiltersProps {
  notes: NoteOption[]
  tags: string[]
  children?: ReactNode
}

interface FilterState extends TaskFilters {
  note?: string
}

export default function TasksFilters({ notes, tags, children }: TasksFiltersProps) {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {children}
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

