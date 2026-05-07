import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // After confirmation the user has a real session — ensure their profile row exists.
    // This is the reliable creation point when email confirmation is required, because
    // during signUp() there is no session yet so the client-side insert is blocked by RLS.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const username = (user.user_metadata?.username as string | undefined)
        ?? user.email?.split('@')[0]
        ?? 'user'
      await supabase
        .from('profiles')
        .upsert({ id: user.id, username }, { onConflict: 'id', ignoreDuplicates: true })
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
