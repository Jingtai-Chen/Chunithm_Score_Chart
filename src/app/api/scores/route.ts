import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calcSongRating, getGrade } from '@/lib/rating'
import type { Difficulty } from '@/types'

const CONST_COL: Record<Difficulty, string> = {
  BASIC:    'basic_const',
  ADVANCED: 'advanced_const',
  EXPERT:   'expert_const',
  MASTER:   'master_const',
  ULTIMA:   'ultima_const',
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: scores, error } = await supabase
    .from('user_scores')
    .select('*, song:songs(*)')
    .eq('user_id', user.id)
    .order('song_rating', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ scores: scores ?? [] })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { song_id, difficulty, score, lamp } = await request.json() as {
    song_id: string
    difficulty: Difficulty
    score: number
    lamp: string
  }

  // Ensure the profile row exists before inserting scores (FK requirement).
  // Missing profiles can happen when email confirmation is on and the client-side
  // insert during registration was blocked by RLS before the user had a session.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existingProfile) {
    const username = (user.user_metadata?.username as string | undefined)
      ?? user.email?.split('@')[0]
      ?? 'user'
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, username })
    // 23505 = another request just created it concurrently — that's fine
    if (profileError && profileError.code !== '23505') {
      return NextResponse.json({ error: 'Could not initialize profile.' }, { status: 500 })
    }
  }

  // Fetch chart constant server-side
  const constCol = CONST_COL[difficulty]
  const { data: song } = await supabase
    .from('songs')
    .select(constCol)
    .eq('id', song_id)
    .single()

  const chartConst: number | null = (song as Record<string, number | null> | null)?.[constCol] ?? null
  if (chartConst == null) {
    return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
  }

  const grade = getGrade(score)
  const song_rating = parseFloat(calcSongRating(score, chartConst).toFixed(2))

  const { data: upserted, error: upsertError } = await supabase
    .from('user_scores')
    .upsert(
      { user_id: user.id, song_id, difficulty, score, grade, lamp, song_rating, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,song_id,difficulty' }
    )
    .select()
    .single()

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  // Recalculate B30 from top-30 scores
  const { data: top30 } = await supabase
    .from('user_scores')
    .select('song_rating')
    .eq('user_id', user.id)
    .order('song_rating', { ascending: false })
    .limit(30)

  const b30_rating = top30 && top30.length > 0
    ? parseFloat((top30.reduce((s, r) => s + r.song_rating, 0) / top30.length).toFixed(2))
    : 0

  await supabase
    .from('profiles')
    .update({ b30_rating })
    .eq('id', user.id)

  return NextResponse.json({ score: upserted, b30_rating })
}
