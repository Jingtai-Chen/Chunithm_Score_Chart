'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Song, Difficulty } from '@/types'
import ModalShell from './ModalShell'

const COVER_BASE = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover'

const DIFF_STYLE: Record<Difficulty, { bg: string; text: string }> = {
  BASIC:    { bg: '#14532d', text: '#86efac' },
  ADVANCED: { bg: '#431407', text: '#fdba74' },
  EXPERT:   { bg: '#450a0a', text: '#fca5a5' },
  MASTER:   { bg: '#2e1065', text: '#c4b5fd' },
  ULTIMA:   { bg: '#0f172a', text: '#94a3b8' },
}

const DIFF_ORDER: Difficulty[] = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'ULTIMA']

type DiffFilter = 'ALL' | Difficulty
type SortOrder = 'HIGH' | 'LOW'

function songConst(song: Song, diff: Difficulty): number | null {
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
  onSelect: (song: Song) => void
  onClose: () => void
}

export default function SearchModal({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [searching, setSearching] = useState(false)
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('ALL')
  const [sortOrder, setSortOrder] = useState<SortOrder>('HIGH')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setSearching(true)
    const t = setTimeout(async () => {
      const res = await fetch(`/api/songs?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.songs ?? [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const displayResults = useMemo(() => {
    let list = results

    if (diffFilter !== 'ALL') {
      list = list.filter(song => songConst(song, diffFilter) != null)
      list = [...list].sort((a, b) => {
        const ca = songConst(a, diffFilter) ?? 0
        const cb = songConst(b, diffFilter) ?? 0
        return sortOrder === 'HIGH' ? cb - ca : ca - cb
      })
    }

    return list
  }, [results, diffFilter, sortOrder])

  const hasResults = !searching && displayResults.length > 0
  const noResults  = !searching && query.trim() && displayResults.length === 0

  return (
    <ModalShell step={1} stepLabel="Song search" onBack={onClose} onClose={onClose}>
      {/* Search input */}
      <div className="p-4 pb-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or artist…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        {/* Difficulty filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', ...DIFF_ORDER] as DiffFilter[]).map(d => {
            const active = diffFilter === d
            const style = d === 'ALL' ? null : DIFF_STYLE[d]
            return (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-opacity"
                style={
                  active
                    ? d === 'ALL'
                      ? { background: '#7c3aed', color: '#fff' }
                      : { background: style!.bg, color: style!.text, outline: `1px solid ${style!.text}` }
                    : { background: '#1a1a2e', color: '#64748b' }
                }
              >
                {d}
              </button>
            )
          })}
        </div>

        {/* Sort — only visible when a specific difficulty is selected */}
        {diffFilter !== 'ALL' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Sort:</span>
            {(['HIGH', 'LOW'] as SortOrder[]).map(order => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
                style={
                  sortOrder === order
                    ? { background: '#2a2a40', color: '#e2e8f0' }
                    : { background: 'transparent', color: '#64748b' }
                }
              >
                {order === 'HIGH' ? 'HIGH → LOW' : 'LOW → HIGH'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#2a2a40' }} />

      {/* Results */}
      <div className="pb-2">
        {!query.trim() && (
          <p className="text-center text-slate-500 text-sm py-10">Type to search songs.</p>
        )}
        {query.trim() && searching && (
          <p className="text-center text-slate-500 text-sm py-10">Searching…</p>
        )}
        {noResults && (
          <p className="text-center text-slate-500 text-sm py-10">No songs found.</p>
        )}
        {hasResults && displayResults.map(song => {
          const chips = diffFilter === 'ALL'
            ? DIFF_ORDER.filter(d => songConst(song, d) != null)
            : [diffFilter]

          return (
            <button
              key={song.id}
              onClick={() => onSelect(song)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="w-10 h-10 rounded shrink-0 overflow-hidden" style={{ background: '#0f0f1a' }}>
                {song.image_name
                  ? <img src={`${COVER_BASE}/${song.image_name}`} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-base">♪</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                <p className="text-slate-400 text-xs truncate">{song.artist}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {chips.map(d => (
                    <span
                      key={d}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: DIFF_STYLE[d].bg, color: DIFF_STYLE[d].text }}
                    >
                      {d}
                      {diffFilter !== 'ALL' && (
                        <span className="ml-1 opacity-75">{songConst(song, d)?.toFixed(1)}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ModalShell>
  )
}
