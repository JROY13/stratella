'use client'

import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase-client'
import SignInForm, { ensureStarterNote } from '@/components/auth/SignInForm'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { syncCookieAndWait } from '@/lib/auth-sync'

export default function LoginCard() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      if (data.session) {
        await syncCookieAndWait(data.session)
        await ensureStarterNote(data.session.user.id)
        router.replace('/notes')
      }
    })

    const { data: sub } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await syncCookieAndWait(session)
        await ensureStarterNote(session.user.id)
        router.replace('/notes')
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] grid place-items-center px-4">
      <div className="max-w-2xl text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Image src="/stratella-dark.png" alt="Stratella" width={72} height={72} className="rounded-md" />
          <span className="text-4xl font-semibold tracking-tight">Stratella</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold">
          All your tasks. From every note. In one place.
        </h1>
        <p className="text-muted-foreground">
          Stop hunting through docs for tasks—your checkboxes auto-collect into a single <em>Task List</em>.
          Coming soon: AI summaries that brief you before every session.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
