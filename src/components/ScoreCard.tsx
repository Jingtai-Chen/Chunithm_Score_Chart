'use client'

import { useState } from 'react'
import type { UserScoreWithSong } from '@/types'

const COVER_BASE = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover'

const DIFF_STYLE: Record<string, { bg: string; text: string; border?: string }> = {
  BASIC:    { bg: '#14532d', text: '#86efac' },
  ADVANCED: { bg: '#431407', text: '#fdba74' },
  EXPERT:   { bg: '#450a0a', text: '#fca5a5' },
  MASTER:   { bg: '#2e1065', text: '#c4b5fd' },
  ULTIMA:   { bg: '#0f172a', text: '#94a3b8', border: '#334155' },
}

const GRADE_COLOR: Record<string, string> = {
  AJC:   '#fbbf24',
  'SSS+':'#fde047',
  SSS:   '#fde047',
  'SS+': '#fb923c',
  SS:    '#fb923c',
  'S+':  '#4ade80',
  S:     '#4ade80',
  AAA:   '#60a5fa',
  AA:    '#60a5fa',
  A:     '#94a3b8',
}

interface Props {
  score: UserScoreWithSong
  rank: number
}

export default function ScoreCard({ score, rank }: Props) {
  const [imgError, setImgError] = useState(false)
  const diff = DIFF_STYLE[score.difficulty] ?? DIFF_STYLE.MASTER
  const gradeColor = GRADE_COLOR[score.grade] ?? '#94a3b8'
  const isTop3 = rank <= 3

  return (
    <div className="rounded-lg overflow-hidden flex flex-col transition-transform duration-150 hover:scale-[1.02] hover:ring-1 ring-violet-500/40" style={{ background: '#18182a', border: '1px solid #2a2a40' }}>
      {/* Cover */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
        {imgError || !score.song.image_name ? (
          <div className="absolute inset-0 flex items-center justify-center text-3xl select-none" style={{ background: '#0f0f1a' }}>
            ♪
          </div>
        ) : (
          <img
            src={`${COVER_BASE}/${score.song.image_name}`}
            alt={score.song.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}

        {/* Rank badge — top left */}
        <div
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none"
          style={isTop3
            ? { background: '#7c3aed', color: '#fff' }
            : { background: 'rgba(0,0,0,0.6)', color: '#94a3b8' }}
        >
          {rank}
        </div>

        {/* Lamp dot — top right */}
        {score.lamp !== 'NONE' && (
          <div
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
            style={{ background: score.lamp === 'AJC' || score.lamp === 'AJ' ? '#a78bfa' : '#4ade80' }}
          />
        )}

        {/* Song rating — bottom right */}
        <div
          className="absolute bottom-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.72)', color: '#a78bfa' }}
        >
          {score.song_rating.toFixed(2)}
        </div>
      </div>

      {/* Info */}
      <div className="px-2 py-1.5 flex flex-col gap-1 min-w-0">
        <p className="text-white text-xs font-medium truncate leading-tight">{score.song.title}</p>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
            style={{ background: diff.bg, color: diff.text, border: diff.border ? `1px solid ${diff.border}` : undefined }}
          >
            {score.difficulty}
          </span>
          <span className="text-xs font-bold" style={{ color: gradeColor }}>{score.grade}</span>
        </div>
        <p className="text-slate-400 text-xs tabular-nums">{score.score.toLocaleString()}</p>
      </div>
    </div>
  )
}
