export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavButton } from '@/components/NavButton'
import { extractTasksFromHtml, filterTasks, TaskFilters, TaskWithNote } from '@/lib/taskparse'
import { toggleTaskFromNote, setTaskDueFromNote } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TaskRow from '@/components/tasks/TaskRow'
import TasksFilters from '@/components/tasks/TasksFilters'

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
          <TasksFilters notes={notes ?? []} tags={tagOptions} />
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
                      <TaskRow
                        key={t.line}
                        task={{ title: t.text, done: t.checked, due: t.due }}
                        onToggle={async () => {
                          await toggleTaskFromNote(group.id, t.line)
                        }}
                        onDueChange={async value => {
                          const fd = new FormData()
                          fd.append('due', value)
                          await setTaskDueFromNote(group.id, t.line, fd)
                        }}
                      />
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
