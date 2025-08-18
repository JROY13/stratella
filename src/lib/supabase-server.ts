import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Supabase client for Server Components
export function supabaseServer() {
  return createServerComponentClient({ cookies })
}
