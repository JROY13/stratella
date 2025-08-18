import type { Session } from '@supabase/supabase-js'

export async function syncCookieAndWait(session: Session): Promise<boolean> {
  await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'SIGNED_IN' as const, session }),
  })

  for (let i = 0; i < 20; i++) {
    const w = await fetch('/auth/whoami', { cache: 'no-store' })
    const j: unknown = await w.json().catch(() => ({}))
    if ((j as { user?: unknown })?.user) return true
    await new Promise((res) => setTimeout(res, 100))
  }
  return false
}
