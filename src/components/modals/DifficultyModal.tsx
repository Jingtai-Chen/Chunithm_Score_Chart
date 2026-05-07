'use client'

import type { Song, Difficulty } from '@/types'
import ModalShell from './ModalShell'

const COVER_BASE = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover'

const DIFF_STYLE: Record<Difficulty, { bg: string; text: string; border?: string }> = {
  BASIC:    { bg: '#14532d', text: '#86efac' },
  ADVANCED: { bg: '#431407', text: '#fdba74' },
  EXPERT:   { bg: '#450a0a', text: '#fca5a5' },
  MASTER:   { bg: '#2e1065', text: '#c4b5fd' },
  ULTIMA:   { bg: '#0f172a', text: '#94a3b8', border: '#334155' },
}

const DIFF_ORDER: Difficulty[] = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'ULTIMA']

function constForDiff(song: Song, diff: Difficulty): number | null {
  const map: Record<Difficulty, number | null> = {
    BASIC:    song.basic_const,
    ADVANCED: song.advanced_const,
    EXPERT:   song.expert_const,
    MASTER:   song.master_const,
    ULTIMA:   song.ultima_const,
  }
  return map[diff]
}

interface Props {
  song: Song
  onSelect: (diff: Difficulty) => void
  onBack: () => void
  onClose: () => void
}

export default function DifficultyModal({ song, onSelect, onBack, onClose }: Props) {
  const available = DIFF_ORDER.filter(d => constForDiff(song, d) != null)
  const mainDiffs = available.filter(d => d !== 'ULTIMA')
  const hasUltima = available.includes('ULTIMA')

  return (
    <ModalShell step={2} stepLabel="Select difficulty" onBack={onBack} onClose={onClose}>
      {/* Song info */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #2a2a40' }}>
        <div className="w-14 h-14 rounded overflow-hidden shrink-0" style={{ background: '#0f0f1a' }}>
          {song.image_name
            ? <img src={`${COVER_BASE}/${song.image_name}`} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">♪</div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{song.title}</p>
          <p className="text-slate-400 text-sm truncate">{song.artist}</p>
        </div>
      </div>

      {/* Difficulty grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {mainDiffs.map(diff => {
          const s = DIFF_STYLE[diff]
          return (
            <button
              key={diff}
              onClick={() => onSelect(diff)}
              className="flex flex-col items-center justify-center py-6 rounded-lg font-semibold transition-opacity hover:opacity-80"
              style={{ background: s.bg, border: s.border ? `1px solid ${s.border}` : undefined }}
            >
              <span className="text-base" style={{ color: s.text }}>{diff}</span>
              <span className="text-sm mt-1 opacity-80" style={{ color: s.text }}>
                {constForDiff(song, diff)?.toFixed(1)}
              </span>
            </button>
          )
        })}

        {hasUltima && (() => {
          const s = DIFF_STYLE.ULTIMA
          return (
            <button
              key="ULTIMA"
              onClick={() => onSelect('ULTIMA')}
              className="col-span-2 flex flex-col items-center justify-center py-6 rounded-lg font-semibold transition-opacity hover:opacity-80"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <span className="text-base" style={{ color: s.text }}>ULTIMA</span>
              <span className="text-sm mt-1 opacity-80" style={{ color: s.text }}>
                {constForDiff(song, 'ULTIMA')?.toFixed(1)}
              </span>
            </button>
          )
        })()}
      </div>
    </ModalShell>
  )
}
