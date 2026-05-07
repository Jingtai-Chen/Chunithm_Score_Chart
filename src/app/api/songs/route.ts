import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) return NextResponse.json({ songs: [] })

  const supabase = createClient()

  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${q}%,artist.ilike.%${q}%`)
    .not('master_const', 'is', null)
    .order('title')
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ songs: songs ?? [] })
}
