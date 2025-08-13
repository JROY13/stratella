'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { extractTasks, toggleTaskInMarkdown } from '@/lib/taskparse'
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
  await supabase.from('notes').update({ title, body }).eq('id', id).eq('user_id', user.id)
  revalidatePath(`/notes/${id}`)
  revalidatePath('/notes')
}

export async function deleteNote(id: string) {
  const { supabase, user } = await requireUser()
  await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/notes')
}

export async function toggleTaskFromPinned(noteId: string, taskLine: number) {
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
  await supabase.from('notes').update({ body: nextBody }).eq('id', noteId)

  revalidatePath('/notes')
  revalidatePath(`/notes/${noteId}`)
}
