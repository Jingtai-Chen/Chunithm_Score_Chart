import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      <DashboardClient
        userId={user.id}
        username={profile?.username ?? ''}
        email={user.email ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  )
}
