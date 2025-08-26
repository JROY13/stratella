'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DateFilterTrigger from './DateFilterTrigger'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TaskFilters } from '@/lib/taskparse'

interface NoteOption {
  id: string
  title: string
}

interface FilterState extends TaskFilters {
  note?: string
}

interface TasksFilterBarProps {
  notes: NoteOption[]
  tags: string[]
  onChange: (filters: FilterState) => void
  onApply?: (filters: FilterState) => void
}

export default function TasksFilterBar({ notes, tags, onChange, onApply }: TasksFilterBarProps) {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterState>({
    completion: searchParams.get('completion') ?? undefined,
    note: searchParams.get('note') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    due: searchParams.get('due') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  })

  useEffect(() => {
    onChange(filters)
  }, [filters, onChange])

  useEffect(() => {
    setFilters({
      completion: searchParams.get('completion') ?? undefined,
      note: searchParams.get('note') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
      due: searchParams.get('due') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
    })
  }, [searchParams])

  function update(patch: Partial<FilterState>) {
    setFilters(f => ({ ...f, ...patch }))
  }

  function clear(key: keyof FilterState) {
    update({ [key]: undefined })
  }

  const pills: { key: keyof FilterState; label: string }[] = []
  if (filters.completion) {
    const label = filters.completion === 'open' ? 'Open' : 'Done'
    pills.push({ key: 'completion', label })
  }
  if (filters.note) {
    const label = notes.find(n => n.id === filters.note)?.title || 'Untitled'
    pills.push({ key: 'note', label })
  }
  if (filters.tag) pills.push({ key: 'tag', label: `#${filters.tag}` })
  if (filters.due) pills.push({ key: 'due', label: filters.due })
  if (filters.sort) pills.push({ key: 'sort', label: `Sort ${filters.sort}` })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.completion ?? ''}
          onChange={e => update({ completion: e.target.value || undefined })}
          className="h-9 rounded-md border border-input bg-transparent px-2"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filters.note ?? ''}
          onChange={e => update({ note: e.target.value || undefined })}
          className="h-9 rounded-md border border-input bg-transparent px-2"
        >
          <option value="">All Notes</option>
          {notes.map(n => (
            <option key={n.id} value={n.id}>
              {n.title || 'Untitled'}
            </option>
          ))}
        </select>
        <select
          value={filters.tag ?? ''}
          onChange={e => update({ tag: e.target.value || undefined })}
          className="h-9 rounded-md border border-input bg-transparent px-2"
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <DateFilterTrigger
          value={filters.due}
          onChange={d => update({ due: d })}
          onClear={() => clear('due')}
        />
        <select
          value={filters.sort ?? ''}
          onChange={e => update({ sort: e.target.value || undefined })}
          className="h-9 rounded-md border border-input bg-transparent px-2"
        >
          <option value="">Sort</option>
          <option value="due">Due</option>
          <option value="text">Text</option>
        </select>
        {onApply && (
          <Button type="button" onClick={() => onApply(filters)}>
            Apply
          </Button>
        )}
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        {pills.map(p => (
          <Badge key={p.key} variant="secondary" className="flex items-center gap-1">
            {p.label}
            <button
              type="button"
              onClick={() => clear(p.key)}
              aria-label={`Clear ${p.key} filter`}
              className="-mr-1 ml-1 text-xs"
            >
              ✕
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}

