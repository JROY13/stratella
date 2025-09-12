"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-client";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";

export default function UserMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function signOut() {
    setLoading(true);
    try {
      await supabaseClient.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={signOut}
            variant="destructive"
            disabled={loading}
          >
            {loading ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/terms">Terms</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/privacy">Privacy</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support">Support</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShortcutsOpen(true)}>
            Keyboard shortcuts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}

