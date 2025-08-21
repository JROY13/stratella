import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

const SAMPLE_TITLE = 'Start Here'
const SAMPLE_BODY = `<h1>Welcome to Stratella</h1>
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
  const supabase = createRouteHandlerClient({ cookies })

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
        title: SAMPLE_TITLE,
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
