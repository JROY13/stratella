'use client'

import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase-client'
import { Auth } from '@supabase/auth-ui-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function syncCookieAndWait(session: any) {
  await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'SIGNED_IN', session }),
  })
  for (let i = 0; i < 20; i++) {
    const w = await fetch('/auth/whoami', { cache: 'no-store' })
    const j = await w.json().catch(() => ({}))
    if (j?.user) return true
    await new Promise(res => setTimeout(res, 100))
  }
  return false
}

export default function LoginCard() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      if (data.session) {
        await syncCookieAndWait(data.session)
        router.replace('/notes')
      }
    })

    const { data: sub } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await syncCookieAndWait(session)
        router.replace('/notes')
      }
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [router])

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] grid place-items-center px-4">
      {/* Hero */}
      <div className="max-w-2xl text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Image src="/stratella-dark.png" alt="Stratella" width={36} height={36} className="rounded-md" />
          <span className="text-2xl font-semibold tracking-tight">Stratella</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">
          All your tasks. From every note. In one place.
        </h1>
        <p className="text-muted-foreground">
          Stop hunting through docs. Write in Markdown—your open tasks auto-collect into a single <em>Task List</em>.
        </p>
        <ul className="text-sm text-muted-foreground grid gap-1">
          <li>• <strong>Write naturally</strong>: <code>- [ ]</code> checkboxes inside any note.</li>
          <li>• <strong>Act fast</strong>: one click to complete from the Task List.</li>
          <li>• <strong>AI-native</strong>: summaries & suggested next steps (coming soon).</li>
        </ul>
      </div>

      {/* Auth */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth supabaseClient={supabaseClient} providers={[]} view="sign_in" />
        </CardContent>
      </Card>
    </div>
  )
}
