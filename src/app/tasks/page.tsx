export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { extractTasks } from '@/lib/taskparse'
import { toggleTaskFromPinned } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function TasksPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,body,updated_at')
    .order('updated_at', { ascending: false })

  const groups = []
  for (const n of notes ?? []) {
    const todos = extractTasks(n.body).filter(t => !t.checked)
    if (todos.length) {
      groups.push({
        id: n.id,
        title: n.title || 'Untitled',
        tasks: todos.map(t => ({ text: t.text, line: t.line })),
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
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
                        <form action={toggleTaskFromPinned.bind(null, group.id, t.line)}>
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
                        <span>{t.text}</span>
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
