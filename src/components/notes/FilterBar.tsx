'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

export interface NoteFilters {
  search?: string
  sort: 'newest' | 'oldest'
}

interface FilterBarProps {
  onChange: (filters: NoteFilters) => void
}

export default function FilterBar({ onChange }: FilterBarProps) {
  const [filters, setFilters] = useState<NoteFilters>({ sort: 'newest' })

  useEffect(() => {
    onChange(filters)
  }, [filters, onChange])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search title…"
        value={filters.search ?? ''}
        onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
        aria-label="Search title"
        className="h-9 w-48"
      />
      <select
        value={filters.sort}
        onChange={e => setFilters(f => ({ ...f, sort: e.target.value as NoteFilters['sort'] }))}
        className="h-9 rounded-md border border-input bg-transparent px-2"
        aria-label="Sort notes"
      >
        <option value="newest">Modified (newest)</option>
        <option value="oldest">Modified (oldest)</option>
      </select>
    </div>
  )
}
