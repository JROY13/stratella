import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components and Server Actions.
 * Auth cookies are managed automatically by @supabase/auth-helpers-nextjs.
 */
export function supabaseServer() {
  return createServerComponentClient({ cookies })
}
