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
  onFiltersChange?: (filters: FilterState) => void
}

interface FilterState extends TaskFilters {
  note?: string
  search?: string
}

export default function TasksFilters({ notes, tags, children, onFiltersChange }: TasksFiltersProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
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

  function handleSearchChange(value: string) {
    setSearchValue(value)
    onFiltersChange?.({ search: value || undefined } as FilterState)
  }

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
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
        <input
          type="search"
          placeholder="Search tasks..."
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:w-64"
          aria-label="Search tasks"
        />
      </div>
      {open && (
        <TasksFilterBar
          notes={notes}
          tags={tags}
          onChange={filters => onFiltersChange?.(filters)}
          onApply={handleApply}
        />
      )}
    </div>
  )
}

