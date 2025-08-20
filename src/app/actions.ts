'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { extractTasks, toggleTaskInMarkdown } from '@/lib/taskparse'
import { normalizeTasks } from '@/lib/markdown'
import { revalidatePath } from 'next/cache'

export async function requireUser() {
  const supabase = await supabaseServer() // <-- await here
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  return { supabase, user }
}

export async function createNote(title: string) {
  const { supabase, user } = await requireUser()
  await supabase.from('notes').insert({ title, user_id: user.id, body: '' })
  revalidatePath('/notes')
}

export async function saveNote(id: string, title: string, body: string) {
  const { supabase, user } = await requireUser()
  const normalized = normalizeTasks(body)
  await supabase.from('notes').update({ title, body: normalized }).eq('id', id).eq('user_id', user.id)
  revalidatePath(`/notes/${id}`)
  revalidatePath('/notes')
}

export async function saveNoteInline(
  id: string,
  body: string,
  opts?: { revalidate?: boolean },
) {
  const { supabase, user } = await requireUser()
  const normalized = normalizeTasks(body)
  await supabase.from('notes').update({ body: normalized }).eq('id', id).eq('user_id', user.id)
  const { revalidate = true } = opts ?? {}
  if (revalidate !== false) {
    revalidatePath(`/notes/${id}`)
    revalidatePath('/notes')
    revalidatePath('/tasks')
  }
}

export async function deleteNote(id: string) {
  const { supabase, user } = await requireUser()
  await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/notes')
}

async function toggleTask(noteId: string, taskLine: number) {
  const { supabase, user } = await requireUser()
  const { data } = await supabase
    .from('notes')
    .select('body')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single()

  if (!data) throw new Error('Note not found')

  const tasks = extractTasks(data.body)
  const hit = tasks.find(t => t.line === taskLine)
  if (!hit) return

  const nextBody = toggleTaskInMarkdown(data.body, hit)
  await supabase
    .from('notes')
    .update({ body: nextBody })
    .eq('id', noteId)
    .eq('user_id', user.id)
}

export async function toggleTaskFromNote(noteId: string, taskLine: number) {
  await toggleTask(noteId, taskLine)
  revalidatePath('/notes')
  revalidatePath(`/notes/${noteId}`)
  revalidatePath('/tasks')
}

export async function setTaskDueFromNote(noteId: string, taskLine: number, formData: FormData) {
  const due = (formData.get('due') as string) || ''
  const { supabase, user } = await requireUser()
  const { data } = await supabase
    .from('notes')
    .select('body')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single()
  if (!data) throw new Error('Note not found')
  const lines = data.body.split('\n')
  if (taskLine >= lines.length) return
  let line = lines[taskLine]
  if (due) {
    if (/due:[^\s]+/.test(line)) {
      line = line.replace(/due:[^\s]+/, `due:${due}`)
    } else {
      line = `${line} due:${due}`
    }
  } else {
    line = line.replace(/\s*due:[^\s]+/, '')
  }
  lines[taskLine] = line
  await supabase
    .from('notes')
    .update({ body: lines.join('\n') })
    .eq('id', noteId)
    .eq('user_id', user.id)
  revalidatePath('/notes')
  revalidatePath(`/notes/${noteId}`)
  revalidatePath('/tasks')
}
