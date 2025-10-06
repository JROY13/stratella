import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const SAMPLE_BODY = `<h1>Start Here</h1>
<p>Welcome to Stratella</p>
<p>This note will help you get started with editing and tasks.</p>
<h2>Formatting Basics</h2>
<p>Use <strong>bold</strong> and <em>italic</em> text to highlight ideas.</p>
<h2>Lists</h2>
<ul>
  <li><p>Bullet one</p></li>
  <li><p>Bullet two</p></li>
</ul>
<ol>
  <li><p>First item</p></li>
  <li><p>Second item</p></li>
</ol>
<p>Check out <a href="https://example.com">this link</a> for more info.</p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">
    <label><input type="checkbox"></label>
    <div>Try completing this task</div>
  </li>
</ul>`

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - called from route handler
          }
        },
      },
    }
  )

  try {
    // Must be signed in
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      if (userErr) console.error('get user error', userErr)
      return NextResponse.json({ ok: false, reason: 'no_user' }, { status: 401 })
    }

    // Only create if user currently has *zero* notes
    const { count, error: countErr } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countErr) {
      console.error('count notes error', countErr)
      return NextResponse.json(
        { ok: false, reason: 'count_error', error: countErr.message },
        { status: 500 }
      )
    }

    if ((count ?? 0) === 0) {
      const { error: insertErr } = await supabase.from('notes').insert({
        user_id: user.id,
        body: SAMPLE_BODY,
      })
      if (insertErr && insertErr.code !== '23505') {
        console.error('insert sample note error', insertErr)
        return NextResponse.json(
          { ok: false, reason: 'insert_error', error: insertErr.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('init-user unexpected error', e)
    return NextResponse.json({ ok: false, reason: 'unexpected_error' }, { status: 500 })
  }
}
