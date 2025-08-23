export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavButton } from '@/components/NavButton'
import { extractTasksFromHtml, filterTasks, TaskFilters, TaskWithNote } from '@/lib/taskparse'
import { toggleTaskFromNote, setTaskDueFromNote } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DueDateInput from '@/components/DueDateInput'
import { cn } from '@/lib/utils'

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,body,updated_at')
    .order('updated_at', { ascending: false })

  const tasks: (TaskWithNote & { noteTitle: string })[] = []
  for (const n of notes ?? []) {
    const todos = extractTasksFromHtml(n.body)
    tasks.push(
      ...todos.map(t => ({ ...t, noteId: n.id, noteTitle: n.title || 'Untitled' }))
    )
  }

  const tagOptions = Array.from(new Set(tasks.flatMap(t => t.tags))).sort()

  const params = await searchParams

  const noteId = typeof params.note === 'string' ? params.note : undefined

  const filters: TaskFilters = {
    completion: typeof params.completion === 'string' ? params.completion : undefined,
    tag: typeof params.tag === 'string' ? params.tag : undefined,
    due: typeof params.due === 'string' ? params.due : undefined,
    sort: typeof params.sort === 'string' ? params.sort : undefined,
  }

  const scoped = noteId ? tasks.filter(t => t.noteId === noteId) : tasks
  const filtered = filterTasks(scoped, filters)

  const groups: { id: string; title: string; tasks: typeof filtered }[] = []
  for (const t of filtered) {
    let g = groups.find(g => g.id === t.noteId)
    if (!g) {
      g = { id: t.noteId, title: t.noteTitle, tasks: [] }
      groups.push(g)
    }
    g.tasks.push(t)
  }

  const emptyMessage =
    filters.completion === 'done' ? 'No closed tasks' : 'No tasks found'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-4 flex flex-wrap gap-2">
            <select
              name="completion"
              defaultValue={filters.completion ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-2"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
            <select
              name="note"
              defaultValue={noteId ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-2"
            >
              <option value="">All Notes</option>
              {notes?.map(n => (
                <option key={n.id} value={n.id}>
                  {n.title || 'Untitled'}
                </option>
              ))}
            </select>
            <select
              name="tag"
              defaultValue={filters.tag ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-2"
            >
              <option value="">All Tags</option>
              {tagOptions.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <Input
              type="date"
              name="due"
              placeholder="Due date"
              title="Selecting a date narrows tasks whose metadata includes due:YYYY-MM-DD"
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
            <p className="text-muted-foreground">{emptyMessage}</p>
          ) : (
            <div className="space-y-6">
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
                    {group.tasks.map(t => (
                      <li key={t.line} className="flex items-center gap-2">
                        {t.checked ? (
                          <div
                            className="inline-flex h-5 w-5 items-center justify-center rounded border border-input bg-transparent text-foreground"
                            aria-hidden="true"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 10l3 3 9-9" />
                            </svg>
                          </div>
                        ) : (
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
                        )}
                        <div
                          className={cn(
                            "flex flex-wrap items-center gap-2",
                            t.checked && "text-muted-foreground line-through"
                          )}
                          aria-label={t.checked ? "Task completed" : "Task not completed"}
                        >
                          <NavButton
                            href={`/notes/${group.id}#L${t.line + 1}`}
                            variant="link"
                            className="p-0 h-auto hover:underline"
                          >
                            {t.text}
                          </NavButton>
                          {t.checked ? (
                            t.due && (
                              <span className="text-xs text-muted-foreground">due {t.due}</span>
                            )
                          ) : (
                            <form action={setTaskDueFromNote.bind(null, group.id, t.line)}>
                              <DueDateInput defaultValue={t.due} />
                            </form>
                          )}
                          {t.status && (
                            <Badge variant="outline" className="text-xs">
                              {t.status}
                            </Badge>
                          )}
                          {t.tags.map(tag => (
                            <span key={tag} className="text-xs text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {t.checked && (
                          <form action={toggleTaskFromNote.bind(null, group.id, t.line)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="submit"
                              title="Reopen task"
                              aria-label="Reopen task"
                            >
                              Undo
                            </Button>
                          </form>
                        )}
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
