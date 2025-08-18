'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabaseClient } from '@/lib/supabase-client'

export default function Header() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function signOut() {
    setLoading(true)
    try {
      await supabaseClient.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/stratella-dark.png"
            alt="Stratella"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <span className="font-semibold tracking-tight">Stratella</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile menu (sidebar links) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                {/* simple burger icon (no extra deps) */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="mt-6 grid gap-2">
                <Link href="/tasks" className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground">Tasks</Link>
                <Link href="/notes" className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground">Notes</Link>
                <Button onClick={signOut} variant="outline" className="mt-4 justify-self-start" disabled={loading}>
                  {loading ? 'Signing out…' : 'Sign out'}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop sign out */}
          <Button variant="outline" onClick={signOut} disabled={loading} className="hidden md:inline-flex">
            {loading ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </header>
  )
}
