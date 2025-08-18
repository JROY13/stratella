'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { syncCookieAndWait } from '@/lib/auth-sync'
import { z } from 'zod'


// --- Sample note content (Markdown) ---
const SAMPLE_NOTE_TITLE = 'Sample Note — Start Here'
const SAMPLE_NOTE_BODY = `# Welcome to Stratella ✨

This is your personal space for notes **and** tasks.
Write in plain text or [Markdown](#markdown-guide) — Stratella will **automatically** collect all your open tasks into your **Tasks** view.

---

## ✅ How Tasks Work

- Tasks are just checklist items in your notes.
- To add a task, start a line with:
\\\`\\\`\\\`
- [ ] Your task description
\\\`\\\`\\\`
- Example:
  - [ ] Write my first note
  - [ ] Add three tasks

When you **check a task** in any note, it will disappear from **Tasks** (because it's complete).

---

## 📄 Markdown Guide <a id="markdown-guide"></a>

Markdown is a simple formatting language. Here are a few basics:

- **Bold text** → \`**bold**\`
- _Italic text_ → \`*italic*\`
- Headings:
\\\`\\\`\\\`
# Heading 1
## Heading 2
### Heading 3
\\\`\\\`\\\`
- Lists:
\\\`\\\`\\\`
- Item one
- Item two
\\\`\\\`\\\`
- Links: [Link text](https://example.com)

---

💡 **Pro tip:** You can mix notes and tasks however you like — Stratella will keep your task list organized automatically.
`

// --- Helper: ensure a user's first note exists (idempotent) ---
export async function ensureStarterNote(userId: string) {
  // Check if user already has any notes
  const { count, error: countErr } = await supabaseClient
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countErr) {
    // Non-fatal; just skip creating the sample note
    console.error('count notes error', countErr)
    return
  }

  if ((count ?? 0) > 0) return

  const { error: insertErr } = await supabaseClient.from('notes').insert({
    user_id: userId,
    title: SAMPLE_NOTE_TITLE,
    body: SAMPLE_NOTE_BODY,
  })

  if (insertErr) {
    // Also non-fatal; the app still works if this fails
    console.error('insert sample note error', insertErr)
  }
}

const signUpSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export default function SignInForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setConfirmPassword('')
  }, [mode])

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
          // Create starter note on FIRST successful sign-in if needed
          await ensureStarterNote(data.session.user.id)
          router.replace('/notes')
        } else {
          setMsg('Signed in, but no session returned. Try refreshing.')
        }
      } else {
        // SIGN UP
        const parsed = signUpSchema.safeParse({ password, confirmPassword })
        if (!parsed.success) {
          setErr(parsed.error.errors[0].message)
          return
        }
        const { data, error } = await supabaseClient.auth.signUp({ email, password })
        if (error) throw error

        if (data.session) {
          // Email confirmations OFF → we already have a session
          await syncCookieAndWait(data.session)
          await ensureStarterNote(data.session.user.id)
          router.replace('/notes')
        } else {
          // Email confirmations ON → no session yet.
          // We cannot create the note until the user confirms & signs in the first time.
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
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
