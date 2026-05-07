import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import B30Grid from '@/components/B30Grid'
import UserMenu from '@/components/UserMenu'

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
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ background: '#0f0f1a', borderBottom: '1px solid #2a2a40' }}
      >
        <span className="font-bold text-white text-lg tracking-wide">CHUNITHM Tracker</span>
        <UserMenu
          userId={user.id}
          username={profile?.username ?? ''}
          email={user.email ?? ''}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </header>

      <main>
        <B30Grid />
      </main>
    </div>
  )
}
