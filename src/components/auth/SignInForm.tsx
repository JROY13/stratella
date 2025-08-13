'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { supabaseClient } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

async function syncCookieAndWait(session: Session) {
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

export default function SignInForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

async function onSubmit(e: FormEvent) {
  e.preventDefault()
  setErr(null)
  setMsg(null)
  setLoading(true)

  try {
    if (mode === 'sign_in') {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data } = await supabaseClient.auth.getSession()
      if (data.session) {
        await syncCookieAndWait(data.session)
        router.replace('/notes')
      } else {
        setMsg('Signed in, but no session returned. Try refreshing.')
      }
    } else {
      const { data, error } = await supabaseClient.auth.signUp({ email, password })
      if (error) throw error

      if (data.session) {
        // Email confirmations OFF → sign in immediately
        await syncCookieAndWait(data.session)
        router.replace('/notes')
      } else {
        // Email confirmations ON → no session, show confirmation message
        setMsg('Check your email to confirm your account, then sign in.')
      }
    }
  } catch (e: unknown) {
    setErr(e instanceof Error ? e.message : 'Something went wrong')
  } finally {
    setLoading(false)
  }
}




  
  async function onForgot() {
    setErr(null); setMsg(null)
    if (!email) return setErr('Enter your email above first.')
    const redirectTo = `${window.location.origin}/login`
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) setErr(error.message)
    else setMsg('Reset email sent—check your inbox.')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{mode === 'sign_in' ? 'Password' : 'Create a password'}</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (mode === 'sign_in' ? 'Signing in…' : 'Creating account…') : (mode === 'sign_in' ? 'Sign in' : 'Create account')}
      </Button>

      <div className="text-center text-sm">
        <button type="button" onClick={onForgot} className="underline underline-offset-4 hover:text-primary">
          Forgot your password?
        </button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {mode === 'sign_in' ? (
          <>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setMode('sign_up')} className="underline underline-offset-4 hover:text-primary">
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('sign_in')} className="underline underline-offset-4 hover:text-primary">
              Sign in
            </button>
          </>
        )}
      </div>

      {err && <p className="text-sm text-destructive text-center">{err}</p>}
      {msg && <p className="text-sm text-muted-foreground text-center">{msg}</p>}
    </form>
  )
}
