export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { saveNote, deleteNote } from '@/app/actions'
import MarkdownPreview from '@/components/MarkdownPreview'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Markdown from '@/components/Markdown'


export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ Next 15: await params first
  const { id } = await params
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: note } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (!note) redirect('/notes')

  // Capture the id into a serializable primitive for server actions
  const noteId = id

  async function onSave(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const body  = String(formData.get('body') || '')
    await saveNote(noteId, title, body)
  }

  async function onDelete() {
    'use server'
    await deleteNote(noteId)
    redirect('/notes')
  }

  return (
    <div className="space-y-4">
      <form action={onSave} className="space-y-3">
        <Input name="title" defaultValue={note.title} className="text-lg font-medium" />
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea name="body" defaultValue={note.body} className="min-h-[60vh]" />
          <Card>
            <CardContent className="p-4 prose prose-sm max-w-none">
              <Markdown>{note.body}</Markdown>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button formAction={onDelete} variant="outline">Delete</Button>
        </div>
      </form>
    </div>
  )
}
