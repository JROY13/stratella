"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabaseClient } from "@/lib/supabase-client";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) setSession(session);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    setLoading(true);
    try {
      await supabaseClient.auth.signOut();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Stratella home"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/stratella-dark.png"
            alt="Stratella"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <span className="font-semibold tracking-tight">Stratella</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile menu (sidebar links) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden pointer-events-auto"
                aria-label="Open menu"
              >
                {/* simple burger icon (no extra deps) */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="mt-6 grid gap-2">
                <Link
                  href="/tasks"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Tasks
                </Link>
                <Link
                  href="/notes"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Notes
                </Link>
                {session && (
                  <button
                    onClick={signOut}
                    disabled={loading}
                    className="rounded px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  >
                    {loading ? "Signing out…" : "Sign out"}
                  </button>
                )}
                <Separator className="my-2" />
                <Link
                  href="/why-stratella"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Why Stratella
                </Link>
                <Link
                  href="/about"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  About
                </Link>
                <Link
                  href="/terms"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Privacy
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href="/why-stratella"
            className="hidden md:block rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            Why Stratella
          </Link>
          <Link
            href="/about"
            className="hidden md:block rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            About
          </Link>
          {session ? (
            <UserMenu />
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
