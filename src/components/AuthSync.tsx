'use client'

import { useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

export default function AuthSync() {
  useEffect(() => {
    let mounted = true

    // On initial load, sync existing session to server cookies
    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const session = data.session
      if (session) {
        await fetch('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'SIGNED_IN', session }),
        })
      }
    })

    // Keep cookies in sync for any change
    const { data: sub } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        await fetch('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session }),
        })
      }
    )

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return null
}
