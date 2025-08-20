export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { deleteNote, saveNoteInline } from '@/app/actions'
import { htmlToMarkdown } from '@/lib/html'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InlineEditor from '@/components/editor/InlineEditor'


export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ Next 15: await params first
  const { id } = await params
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: note } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (!note) redirect('/notes')

  let body = note.body || ''
  if (body.includes('<') || body.includes('data-type')) {
    const markdown = htmlToMarkdown(body)
    await saveNoteInline(note.id, markdown)
    body = markdown
  }

  // Capture the id into a serializable primitive for server actions
  const noteId = id

  async function onDelete() {
    'use server'
    await deleteNote(noteId)
    redirect('/notes')
  }

  return (
    <div className="space-y-4">
      <Input name="title" defaultValue={note.title} className="text-lg font-medium" />
      <InlineEditor noteId={noteId} markdown={body} />
      <form action={onDelete}>
        <Button type="submit" variant="outline">Delete</Button>
      </form>
    </div>
  )
}
