import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Read-only Supabase client for Server Components.
 * Cookies are managed automatically via auth helpers.
 */
export function supabaseServer() {
  return createServerComponentClient({ cookies })
}
