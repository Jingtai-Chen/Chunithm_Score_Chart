'use client'

import { useState, useEffect, useRef } from 'react'
import type { Song, Difficulty, Lamp } from '@/types'
import { calcSongRating, getGrade } from '@/lib/rating'
import ModalShell from './ModalShell'

const COVER_BASE = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover'

const DIFF_STYLE: Record<Difficulty, { bg: string; text: string; border?: string }> = {
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

function constForDiff(song: Song, diff: Difficulty): number {
  const map: Record<Difficulty, number | null> = {
    BASIC:    song.basic_const,
    ADVANCED: song.advanced_const,
    EXPERT:   song.expert_const,
    MASTER:   song.master_const,
    ULTIMA:   song.ultima_const,
  }
  return map[diff] ?? 0
}

interface Props {
  song: Song
  difficulty: Difficulty
  onSuccess: () => void
  onBack: () => void
  onClose: () => void
}

export default function ScoreModal({ song, difficulty, onSuccess, onBack, onClose }: Props) {
  const [scoreStr, setScoreStr] = useState('')
  const [fc, setFc] = useState(false)
  const [aj, setAj] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const scoreNum = parseInt(scoreStr, 10)
  const validScore = scoreStr !== '' && !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 1_010_000
  const chartConst = constForDiff(song, difficulty)
  const grade = validScore ? getGrade(scoreNum) : null
  const rating = validScore ? calcSongRating(scoreNum, chartConst) : null
  const isAJC = validScore && scoreNum === 1_010_000
  const diff = DIFF_STYLE[difficulty]

  function handleFcChange(checked: boolean) {
    setFc(checked)
    if (!checked) setAj(false)
  }

  function handleAjChange(checked: boolean) {
    setAj(checked)
    if (checked) setFc(true)
  }

  function getLamp(): Lamp {
    if (isAJC) return 'AJC'
    if (aj) return 'AJ'
    if (fc) return 'FC'
    return 'NONE'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validScore) return
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song_id: song.id, difficulty, score: scoreNum, lamp: getLamp() }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Submission failed.')
      setSubmitting(false)
      return
    }

    onSuccess()
  }

  return (
    <ModalShell step={3} stepLabel="Enter score" onBack={onBack} onClose={onClose}>
      {/* Song + difficulty header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #2a2a40' }}>
        <div className="w-14 h-14 rounded overflow-hidden shrink-0" style={{ background: '#0f0f1a' }}>
          {song.image_name
            ? <img src={`${COVER_BASE}/${song.image_name}`} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">♪</div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{song.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: diff.bg, color: diff.text, border: diff.border ? `1px solid ${diff.border}` : undefined }}
            >
              {difficulty}
            </span>
            <span className="text-xs text-slate-400">{chartConst.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Score (0 – 1,010,000)</label>
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={1_010_000}
            value={scoreStr}
            onChange={e => setScoreStr(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-violet-500 [appearance:textfield]"
            style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
            placeholder="e.g. 1005000"
          />
        </div>

        {/* Live preview */}
        {validScore && grade && rating !== null && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
          >
            <span className="text-lg font-bold" style={{ color: GRADE_COLOR[grade] ?? '#94a3b8' }}>
              {grade}
            </span>
            <span className="text-slate-400 text-sm">单曲 Rating</span>
            <span className="ml-auto text-lg font-bold tabular-nums" style={{ color: '#a78bfa' }}>
              {rating.toFixed(2)}
            </span>
          </div>
        )}

        {/* Lamp */}
        {isAJC ? (
          <p className="text-sm text-center font-medium" style={{ color: '#a78bfa' }}>
            AJC 自动标注 ✓
          </p>
        ) : (
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fc}
                onChange={e => handleFcChange(e.target.checked)}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-slate-300">FC</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aj}
                onChange={e => handleAjChange(e.target.checked)}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-slate-300">AJ</span>
            </label>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!validScore || submitting}
          className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-50"
          style={{ background: '#7c3aed' }}
        >
          {submitting ? 'Submitting…' : 'Submit Score'}
        </button>
      </form>
    </ModalShell>
  )
}
