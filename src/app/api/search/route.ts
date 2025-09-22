import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const baseSchema = z.object({
  query: z.string().nullish(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
})

const notesSchema = baseSchema.extend({
  scope: z.literal('notes'),
  sort: z.enum(['newest', 'oldest']).optional(),
})

const tasksSchema = baseSchema.extend({
  scope: z.literal('tasks'),
  completion: z.enum(['open', 'done']).nullish(),
  noteId: z.string().uuid().nullish(),
  tag: z.string().nullish(),
  due: z.string().nullish(),
  sort: z.enum(['due', 'text']).optional(),
})

const requestSchema = z.discriminatedUnion('scope', [notesSchema, tasksSchema])

type NotesPayload = z.infer<typeof notesSchema>
type TasksPayload = z.infer<typeof tasksSchema>

type SearchResponse =
  | {
      scope: 'notes'
      page: number
      pageSize: number
      results: {
        id: string
        title: string | null
        updatedAt: string
        openTasks: number
        rank: number
        highlightTitle: string | null
        highlightBody: string | null
      }[]
    }
  | {
      scope: 'tasks'
      page: number
      pageSize: number
      results: {
        noteId: string
        line: number
        text: string
        tags: string[]
        due: string | null
        status: string | null
        isCompleted: boolean
        noteTitle: string | null
        noteUpdatedAt: string
        rank: number
        highlight: string | null
      }[]
    }

function sanitizeQuery(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  if (!json) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const payload = parsed.data
  const supabase = await supabaseServer()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error(authError)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = payload.page ?? 1
  const pageSize = payload.pageSize ?? 20
  const offset = (page - 1) * pageSize

  try {
    if (payload.scope === 'notes') {
      const response = await searchNotes(payload, {
        supabase,
        userId: user.id,
        page,
        pageSize,
        offset,
      })
      return NextResponse.json(response satisfies SearchResponse)
    }

    const response = await searchTasks(payload, {
      supabase,
      userId: user.id,
      page,
      pageSize,
      offset,
    })
    return NextResponse.json(response satisfies SearchResponse)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

interface SearchContext {
  supabase: Awaited<ReturnType<typeof supabaseServer>>
  userId: string
  page: number
  pageSize: number
  offset: number
}

async function searchNotes(payload: NotesPayload, ctx: SearchContext): Promise<SearchResponse> {
  const queryText = sanitizeQuery(payload.query)
  const { data, error } = await ctx.supabase.rpc('search_notes', {
    p_user_id: ctx.userId,
    p_query: queryText,
    p_limit: ctx.pageSize,
    p_offset: ctx.offset,
    p_sort: payload.sort ?? 'newest',
  })

  if (error) {
    throw error
  }

  const results = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: (row.title as string | null) ?? null,
    updatedAt: row.updated_at as string,
    openTasks: Number(row.open_tasks ?? 0),
    rank: Number(row.rank ?? 0),
    highlightTitle: (row.highlight_title as string | null) ?? null,
    highlightBody: (row.highlight_body as string | null) ?? null,
  }))

  return {
    scope: 'notes',
    page: ctx.page,
    pageSize: ctx.pageSize,
    results,
  }
}

async function searchTasks(payload: TasksPayload, ctx: SearchContext): Promise<SearchResponse> {
  const queryText = sanitizeQuery(payload.query)
  const { data, error } = await ctx.supabase.rpc('search_note_tasks', {
    p_user_id: ctx.userId,
    p_query: queryText,
    p_limit: ctx.pageSize,
    p_offset: ctx.offset,
    p_completion: payload.completion ?? null,
    p_tag: sanitizeQuery(payload.tag),
    p_note_id: payload.noteId ?? null,
    p_due: sanitizeQuery(payload.due),
    p_sort: payload.sort ?? 'text',
  })

  if (error) {
    throw error
  }

  const results = (data ?? []).map((row: Record<string, unknown>) => ({
    noteId: row.note_id as string,
    line: Number(row.line ?? 0),
    text: row.text as string,
    tags: (row.tags as string[]) ?? [],
    due: (row.due as string | null) ?? null,
    status: (row.status as string | null) ?? null,
    isCompleted: Boolean(row.is_completed),
    noteTitle: (row.note_title as string | null) ?? null,
    noteUpdatedAt: row.note_updated_at as string,
    rank: Number(row.rank ?? 0),
    highlight: (row.highlight as string | null) ?? null,
  }))

  return {
    scope: 'tasks',
    page: ctx.page,
    pageSize: ctx.pageSize,
    results,
  }
}
