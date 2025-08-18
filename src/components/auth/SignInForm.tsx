'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { z } from 'zod'


export default function SignInForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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

          await fetch('/api/init-user', { method: 'POST' }).catch((err) =>
            console.error('init-user error', err)
          )
          router.replace('/notes')
        } else {
          const schema = z
            .object({
              password: z.string().min(8, 'Password must be at least 8 characters'),
              confirm: z.string(),
            })
            .refine((v) => v.password === v.confirm, {
              path: ['confirm'],
              message: 'Passwords do not match',
            })
          const parsed = schema.safeParse({ password, confirm })
          if (!parsed.success) {
            setErr(parsed.error.issues[0].message)
            return
          }

          const { data, error } = await supabaseClient.auth.signUp({ email, password })
          if (error) throw error

          if (data.session) {
            await fetch('/api/init-user', { method: 'POST' }).catch((err) =>
              console.error('init-user error', err)
            )
            router.replace('/notes')
          } else {
            setMsg('Check your email to confirm your account, then sign in.')
          }
        }
    } catch (e) {
      if (e instanceof Error) setErr(e.message)
      else setErr('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function onForgot() {
    setErr(null)
    setMsg(null)
    if (!email) {
      setErr('Enter your email above first.')
      return
    }
    const redirectTo = `${window.location.origin}/login`
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) setErr(error.message)
    else setMsg('Reset email sent — check your inbox.')
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

        {mode === 'sign_up' && (
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? mode === 'sign_in'
            ? 'Signing in…'
            : 'Creating account…'
          : mode === 'sign_in'
            ? 'Sign in'
            : 'Create account'}
      </Button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onForgot}
          className="underline underline-offset-4 hover:text-primary"
        >
          Forgot your password?
        </button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {mode === 'sign_in' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('sign_up')}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('sign_in')}
              className="underline underline-offset-4 hover:text-primary"
            >
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
