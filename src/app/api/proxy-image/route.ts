import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOST = 'dp4p6x0xfi5o9.cloudfront.net'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse('Forbidden host', { status: 403 })
  }

  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) return new NextResponse('Upstream error', { status: 502 })

  const buf = await res.arrayBuffer()
  const ct = res.headers.get('content-type') ?? 'image/jpeg'
  return new NextResponse(buf, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
