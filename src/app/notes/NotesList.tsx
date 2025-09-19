'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export type Note = {
  id: string
  title: string
  updated_at: string
  openTasks: number
  highlightTitle?: string | null
  highlightBody?: string | null
  rank?: number
}

type View = 'card' | 'grid' | 'list'

interface NotesListProps {
  notes: Note[]
  loading?: boolean
}

function Highlight({
  text,
  fallback,
  className,
}: {
  text?: string | null
  fallback: string
  className?: string
}) {
  if (text && text.trim()) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
        suppressHydrationWarning
      />
    )
  }
  return <span className={className}>{fallback}</span>
}

export function NotesList({ notes, loading }: NotesListProps) {
  const params = useSearchParams()
  const view = (params.get('view') as View) ?? 'card'

  const gridClass =
    view === 'card'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr'

  return view === 'list' ? (
    <ul className="divide-y" aria-busy={loading}>
      {notes.map(n => {
        const date = new Date(n.updated_at).toUTCString()
        return (
          <li key={n.id} className="py-2">
            <Link
              href={`/notes/${n.id}`}
              className="flex items-center justify-between gap-4"
            >
              <Highlight
                text={n.highlightTitle}
                fallback={n.title || 'Untitled'}
                className="font-medium"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Updated {date} • {n.openTasks} open tasks
              </span>
            </Link>
            {n.highlightBody && (
              <p
                className="mt-1 text-xs text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: n.highlightBody }}
                suppressHydrationWarning
              />
            )}
          </li>
        )
      })}
    </ul>
  ) : (
    <div className={gridClass} aria-busy={loading}>
      {notes.map(n => {
        const date = new Date(n.updated_at).toUTCString()
        return (
          <Link key={n.id} href={`/notes/${n.id}`} className="block h-full">
            <Card className="h-full flex flex-col hover:bg-accent/30 transition">
              <CardContent className="p-4 flex-1 space-y-2">
                <Highlight
                  text={n.highlightTitle}
                  fallback={n.title || 'Untitled'}
                  className="font-medium"
                />
                {n.highlightBody && (
                  <div
                    className="text-xs text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: n.highlightBody }}
                    suppressHydrationWarning
                  />
                )}
                <div className="text-xs text-muted-foreground">
                  Updated {date} • {n.openTasks} open tasks
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
