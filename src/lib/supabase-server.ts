import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Read-only Supabase client for Server Components.
 * We read cookies here, but DO NOT write them.
 * Cookie writes happen in /auth/refresh (Route Handler) or in Server Actions.
 */
export async function supabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // RSC: allowed to read
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        },
        // RSC: not allowed to write — leave as no-op
        setAll() {
          /* no-op on purpose */
        },
      },
    }
  )
}
