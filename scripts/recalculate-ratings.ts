import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function calcSongRating(score: number, chartConst: number): number {
  if (score >= 1_009_000) return chartConst + 2.15
  if (score >= 1_007_500) return chartConst + 2.00 + (score - 1_007_500) / 10_000
  if (score >= 1_005_000) return chartConst + 1.50 + (score - 1_005_000) /  5_000
  if (score >= 1_000_000) return chartConst + 1.00 + (score - 1_000_000) / 10_000
  if (score >=   975_000) return chartConst +        (score -   975_000) / 25_000
  return Math.max(0, chartConst * (score / 975_000))
}

const DIFF_CONST_COL: Record<string, string> = {
  BASIC:    'basic_const',
  ADVANCED: 'advanced_const',
  EXPERT:   'expert_const',
  MASTER:   'master_const',
  ULTIMA:   'ultima_const',
}

async function main() {
  console.log('Fetching all user_scores with song constants…')

  type ScoreRow = {
    id: string
    user_id: string
    score: number
    difficulty: string
    song: Record<string, number | null>
  }

  // Fetch in pages to avoid row limit
  const PAGE = 1000
  let from = 0
  const allScores: ScoreRow[] = []

  while (true) {
    const { data, error } = await supabase
      .from('user_scores')
      .select(`
        id, user_id, score, difficulty,
        song:songs(basic_const, advanced_const, expert_const, master_const, ultima_const)
      `)
      .range(from, from + PAGE - 1)

    if (error) { console.error('Fetch error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    allScores.push(...(data as unknown as ScoreRow[]))
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`Loaded ${allScores.length} scores. Recalculating…`)

  // Build updates
  const updates = allScores.map(row => {
    const constCol = DIFF_CONST_COL[row.difficulty]
    const chartConst = row.song?.[constCol] as number | null
    if (chartConst == null) {
      console.warn(`  Skipping ${row.id}: no chart const for ${row.difficulty}`)
      return null
    }
    const song_rating = Math.round(calcSongRating(row.score, chartConst) * 100) / 100
    return { id: row.id, song_rating }
  }).filter(Boolean) as Array<{ id: string; song_rating: number }>

  // Update each row individually (migration script — correctness over speed)
  let updated = 0
  for (const row of updates) {
    const { error } = await supabase
      .from('user_scores')
      .update({ song_rating: row.song_rating })
      .eq('id', row.id)
    if (error) { console.error(`Update error on ${row.id}:`, error.message); process.exit(1) }
    updated++
    if (updated % 50 === 0 || updated === updates.length) {
      console.log(`  Updated ${updated}/${updates.length}…`)
    }
  }

  // Recalculate b30_rating per user
  console.log('Recalculating b30_rating per profile…')

  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id')
  if (pErr) { console.error(pErr.message); process.exit(1) }

  for (const profile of profiles ?? []) {
    const userScores = updates.filter(u =>
      allScores.find(s => s.id === u.id)?.user_id === profile.id
    )
    const top30 = userScores
      .sort((a, b) => b.song_rating - a.song_rating)
      .slice(0, 30)
    const b30_rating = top30.length > 0
      ? Math.round(top30.reduce((s, r) => s + r.song_rating, 0) / top30.length * 100) / 100
      : 0

    const { error } = await supabase
      .from('profiles')
      .update({ b30_rating })
      .eq('id', profile.id)
    if (error) console.warn(`  Profile ${profile.id}: ${error.message}`)
    else console.log(`  ${profile.id}: b30_rating = ${b30_rating}`)
  }

  console.log('Done.')
}

main()
