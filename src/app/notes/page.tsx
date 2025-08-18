export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createNote } from '@/app/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function NotesPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('id,title,updated_at')
    .order('updated_at', { ascending: false })

  async function newNote(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string) || 'Untitled'
    await createNote(title)
  }

  return (
    <div className="space-y-6">
      <form action={newNote} className="flex gap-2">
        <Input name="title" placeholder="New note title…" />
        <Button type="submit">Add</Button>
      </form>

      <div className="grid gap-3">
        {(notes ?? []).map(n => (
          <Link key={n.id} href={`/notes/${n.id}`}>
            <Card className="hover:bg-accent/30 transition">
              <CardContent className="p-4">
                <div className="font-medium">{n.title || 'Untitled'}</div>
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(n.updated_at).toUTCString()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
