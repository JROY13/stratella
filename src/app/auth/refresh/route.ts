import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Make this route dynamic so it never gets cached
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { event, session } = await req.json().catch(() => ({} as any))

  // We'll set cookies on THIS response so they actually reach the browser.
  const res = NextResponse.json({ ok: true })

  // We still read incoming cookies from the request:
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read existing cookies (from the request)
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        },
        // Write new cookies onto the RESPONSE (critical!)
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  try {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token!,
      })
      if (error) return NextResponse.json({ ok: false, reason: 'setSession', error: error.message })
      return res
    }

    if (event === 'SIGNED_OUT') {
      const { error } = await supabase.auth.signOut()
      if (error) return NextResponse.json({ ok: false, reason: 'signOut', error: error.message })
      return res
    }

    return NextResponse.json({ ok: false, reason: 'invalid_event' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: 'exception', error: e?.message || String(e) })
  }
}
