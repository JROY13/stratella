export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { extractTasks, filterTasks, TaskFilters, TaskWithNote } from '@/lib/taskparse'
import { toggleTaskFromNote } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default async function TasksPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,body,updated_at')
    .order('updated_at', { ascending: false })

  let tasks: (TaskWithNote & { noteTitle: string })[] = []
  for (const n of notes ?? []) {
    const todos = extractTasks(n.body)
    tasks.push(
      ...todos.map(t => ({ ...t, noteId: n.id, noteTitle: n.title || 'Untitled' }))
    )
  }

  const filters: TaskFilters = {
    status: typeof searchParams.status === 'string' ? searchParams.status : undefined,
    note: typeof searchParams.note === 'string' ? searchParams.note : undefined,
    tag: typeof searchParams.tag === 'string' ? searchParams.tag : undefined,
    due: typeof searchParams.due === 'string' ? searchParams.due : undefined,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : undefined,
  }

  const filtered = filterTasks(tasks, filters)

  const groups: { id: string; title: string; tasks: typeof filtered }[] = []
  for (const t of filtered) {
    let g = groups.find(g => g.id === t.noteId)
    if (!g) {
      g = { id: t.noteId, title: t.noteTitle, tasks: [] }
      groups.push(g)
    }
    g.tasks.push(t)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-4 flex flex-wrap gap-2">
            <select
              name="status"
              defaultValue={filters.status ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-2"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
            <Input
              name="note"
              placeholder="Note ID"
              defaultValue={filters.note ?? ''}
              className="w-24"
            />
            <Input
              name="tag"
              placeholder="Tag"
              defaultValue={filters.tag ?? ''}
              className="w-24"
            />
            <Input
              type="date"
              name="due"
              defaultValue={filters.due ?? ''}
              className="w-36"
            />
            <select
              name="sort"
              defaultValue={filters.sort ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-2"
            >
              <option value="">Sort</option>
              <option value="due">Due</option>
              <option value="text">Text</option>
            </select>
            <Button type="submit">Apply</Button>
          </form>
          {groups.length === 0 ? (
            <p className="text-muted-foreground">No open tasks 🎉</p>
          ) : (
            <div className="space-y-6">
              {groups.map(group => (
                <div key={group.id}>
                  <Link href={`/notes/${group.id}`} className="font-medium underline">
                    {group.title}
                  </Link>
                  <ul className="mt-2 space-y-2">
                    {group.tasks.map(t => (
                      <li key={t.line} className="flex items-center gap-2">
                        <form action={toggleTaskFromNote.bind(null, group.id, t.line)}>
                          <Button
                            type="submit"
                            title="Mark done"
                            aria-label="Mark done"
                            className="group inline-flex h-5 w-5 items-center justify-center rounded border border-input bg-transparent
                                      text-transparent transition-colors
                                      hover:bg-foreground hover:text-background"
                          >
                            {/* ✓ appears only on hover */}
                            <svg
                              viewBox="0 0 20 20"
                              className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 10l3 3 9-9" />
                            </svg>
                          </Button>
                        </form>
                        <Link href={`/notes/${group.id}#L${t.line + 1}`} className="hover:underline">
                          {t.text}
                        </Link>
                        {t.due && (
                          <span className="text-xs text-muted-foreground">due {t.due}</span>
                        )}
                        {t.status && (
                          <Badge variant="outline" className="text-xs">
                            {t.status}
                          </Badge>
                        )}
                        {t.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
