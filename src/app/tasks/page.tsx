export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { extractTitleFromHtml } from '@/lib/note'
import TasksClient from './TasksClient'

type SearchParamMap = Record<string, string | string[] | undefined>

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamMap>
}) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = (searchParams ? await searchParams : {}) ?? {}

  const normalize = (value: string | string[] | undefined) =>
    typeof value === 'string' ? value.trim() || undefined : undefined

  const initialFilters = {
    completion: normalize(params.completion),
    tag: normalize(params.tag),
    due: normalize(params.due),
    sort: normalize(params.sort),
    note: normalize(params.note),
    search: normalize(params.search),
  }

  const { data: notes } = await supabase
    .from('notes')
    .select('id, body, title, updated_at')
    .order('updated_at', { ascending: false })

  const noteOptions = (notes ?? []).map(n => ({
    id: n.id,
    title: n.title || extractTitleFromHtml(n.body) || 'Untitled',
  }))

  const { data: tagRows } = await supabase.from('note_tasks').select('tags')
  const tags = Array.from(
    new Set((tagRows ?? []).flatMap(row => (row.tags as string[] | null | undefined) ?? [])),
  ).sort()

  const { data: taskRows, error: taskError } = await supabase.rpc('search_note_tasks', {
    p_user_id: user.id,
    p_query: initialFilters.search ?? null,
    p_limit: 200,
    p_offset: 0,
    p_completion: initialFilters.completion ?? null,
    p_tag: initialFilters.tag ?? null,
    p_note_id: initialFilters.note ?? null,
    p_due: initialFilters.due ?? null,
    p_sort: initialFilters.sort ?? 'text',
  })

  if (taskError) {
    console.error(taskError)
    throw taskError
  }

  const initialTasks = (taskRows ?? []).map((row: Record<string, unknown>) => ({
    noteId: row.note_id as string,
    line: Number(row.line ?? 0),
    text: row.text as string,
    tags: (row.tags as string[] | null | undefined) ?? [],
    due: (row.due as string | null | undefined) ?? null,
    status: (row.status as string | null | undefined) ?? null,
    isCompleted: Boolean(row.is_completed),
    noteTitle: (row.note_title as string | null | undefined) ?? null,
    noteUpdatedAt: row.note_updated_at as string,
    highlight: (row.highlight as string | null | undefined) ?? null,
    rank: Number(row.rank ?? 0),
  }))

  return (
    <div className="space-y-6">
      <TasksClient
        notes={noteOptions}
        tags={tags}
        initialFilters={initialFilters}
        initialTasks={initialTasks}
      />
    </div>
  )
}
