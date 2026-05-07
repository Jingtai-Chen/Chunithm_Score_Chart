import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DATA_URL = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/data.json'

interface ZetarakuChart {
  category: string
  title: string
  artist: string
  imageName: string
  releaseDate?: string
  isNew?: boolean
  isLocked?: boolean
  sheets: Array<{
    type: string
    difficulty: string
    level: string
    levelValue: number
    internalLevel?: number | null
    internalLevelIsEstimated?: boolean
    noteDesigner?: string
    isSpecial?: boolean
  }>
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  console.log('Fetching Zetaraku data...')
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  const data = await res.json()

  const songs: ZetarakuChart[] = data.songs ?? []
  console.log(`Fetched ${songs.length} total entries`)

  // Filter out WORLD'S END charts
  const filtered = songs.filter((s) => s.category !== "WORLD'S END")
  console.log(`After filtering WORLD'S END: ${filtered.length} songs`)

  const DIFF_MAP: Record<string, string> = {
    bas: 'basic',
    adv: 'advanced',
    exp: 'expert',
    mas: 'master',
    ult: 'ultima',
  }

  const rows = filtered.map((song) => {
    const sheetMap: Record<string, { level: string; levelConst: number | null }> = {}
    for (const sheet of song.sheets) {
      const key = DIFF_MAP[sheet.difficulty] ?? sheet.difficulty.toLowerCase()
      sheetMap[key] = {
        level: sheet.level,
        levelConst: sheet.internalLevel ?? null,
      }
    }

    return {
      title: song.title,
      artist: song.artist,
      genre: song.category,
      image_name: song.imageName,
      basic_level: sheetMap['basic']?.level ?? null,
      advanced_level: sheetMap['advanced']?.level ?? null,
      expert_level: sheetMap['expert']?.level ?? null,
      master_level: sheetMap['master']?.level ?? null,
      ultima_level: sheetMap['ultima']?.level ?? null,
      basic_const: sheetMap['basic']?.levelConst ?? null,
      advanced_const: sheetMap['advanced']?.levelConst ?? null,
      expert_const: sheetMap['expert']?.levelConst ?? null,
      master_const: sheetMap['master']?.levelConst ?? null,
      ultima_const: sheetMap['ultima']?.levelConst ?? null,
    }
  })

  // Truncate first so re-runs are safe (songs are read-only seed data)
  const { error: truncateError } = await supabase.rpc('truncate_songs')
  if (truncateError) {
    // Fallback: delete all rows if the RPC doesn't exist
    const { error: deleteError } = await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (deleteError) {
      console.error('Delete error:', deleteError)
      process.exit(1)
    }
  }

  // Insert in batches of 200 to stay within Supabase payload limits
  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('songs').insert(batch)
    if (error) {
      console.error(`Insert error at batch ${i / BATCH + 1}:`, error)
      process.exit(1)
    }
    console.log(`  Inserted rows ${i + 1}–${Math.min(i + BATCH, rows.length)}`)
  }

  console.log(`Done! ${rows.length} songs seeded successfully.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
