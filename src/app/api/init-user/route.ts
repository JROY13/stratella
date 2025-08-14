import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const SAMPLE_TITLE = 'Sample Note — Start Here'
const SAMPLE_BODY = `# Welcome to Stratella

This is a sample note to get you started.

## How tasks work

Write tasks anywhere in your notes using Markdown checkboxes:

- [ ] This is an open task
- [x] This is a completed task
- [ ] Add three tasks to this note

Only **unchecked** tasks appear under the **Tasks** view, grouped by the note they live in.  
Click a task’s checkbox in **Tasks** to mark it done in the original note.

## Quick Markdown cheatsheet

# Heading 1
## Heading 2, etc.
**bold**, *italic*

Lists:
- item
1. item

Links: [text](https://example.com)

Have fun!
`

export async function POST() {
  // We’ll return *this* response so any cookies written by Supabase land in the browser if needed
  const res = NextResponse.json({ ok: true })
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read incoming cookies for auth
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        },
        // Write any updated cookies to the *response* (usually none for read ops, but safe)
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // Must be signed in
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ ok: false, reason: 'no_user' }, { status: 401 })
  }

  // Only create if user currently has *zero* notes
  const { count, error: countErr } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countErr) {
    return NextResponse.json({ ok: false, reason: 'count_error', error: countErr.message }, { status: 500 })
  }

  if ((count ?? 0) === 0) {
    const { error: insertErr } = await supabase.from('notes').insert({
      user_id: user.id,
      title: SAMPLE_TITLE,
      body: SAMPLE_BODY,
    })
    if (insertErr) {
      return NextResponse.json({ ok: false, reason: 'insert_error', error: insertErr.message }, { status: 500 })
    }
  }

  return res
}
