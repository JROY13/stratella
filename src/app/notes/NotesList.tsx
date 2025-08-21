'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

type Note = { id: string; title: string | null; updated_at: string }

type View = 'card' | 'grid' | 'list'

export function NotesList({ notes }: { notes: Note[] }) {
  const [view, setView] = useState<View>('card')

  const gridClass =
    view === 'card'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'

  return (
    <div className="space-y-3">
      <select
        value={view}
        onChange={e => setView(e.target.value as View)}
        className="h-9 rounded-md border border-input bg-transparent px-2"
      >
        <option value="card">Card</option>
        <option value="grid">Grid</option>
        <option value="list">List</option>
      </select>

      {view === 'list' ? (
        <ul className="divide-y">
          {notes.map(n => (
            <li key={n.id}>
              <Link
                href={`/notes/${n.id}`}
                className="flex items-center justify-between py-2"
              >
                <span className="font-medium">{n.title || 'Untitled'}</span>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(n.updated_at).toUTCString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={gridClass}>
          {notes.map(n => (
            <Link key={n.id} href={`/notes/${n.id}`}>
              <Card className="hover:bg-accent/30 transition">
                <CardContent className="p-4">
                  <div className="font-medium">{n.title || 'Untitled'}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(n.updated_at).toUTCString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
