import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type AllowedEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'

const cookieDefaults = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    body = null
  }

  const { event, session } = (body ?? {}) as {
    event?: AllowedEvent
    session?: Session | null
  }

  const res = NextResponse.json({ ok: true })
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieDefaults,
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, { ...cookieDefaults, ...options })
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, reason: 'exception', error: message })
  }
}
