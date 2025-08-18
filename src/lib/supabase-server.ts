import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase client for Server Components (read-only)
export async function supabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          /* no-op */
        },
        remove() {
          /* no-op */
        },
      },
    },
  )
}
