import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Supabase client for Server Components (read-only)
export async function supabaseServer() {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
