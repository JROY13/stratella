export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LoginCard from '@/app/(auth)/login/LoginCard'

export default async function LoginPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/notes')
  return <LoginCard />
}
