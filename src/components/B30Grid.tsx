'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { UserScoreWithSong, Song, Difficulty } from '@/types'
import ScoreCard from './ScoreCard'
import StatsBar from './StatsBar'
import SearchModal from './modals/SearchModal'
import DifficultyModal from './modals/DifficultyModal'
import ScoreModal from './modals/ScoreModal'

const SLOTS = 30

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden animate-pulse" style={{ background: '#18182a', border: '1px solid #2a2a40' }}>
      <div style={{ aspectRatio: '1 / 1', background: '#0f0f1a' }} />
      <div className="px-2 py-1.5 space-y-2">
        <div className="h-2.5 rounded" style={{ background: '#2a2a40', width: '75%' }} />
        <div className="h-2 rounded" style={{ background: '#2a2a40', width: '45%' }} />
        <div className="h-2 rounded" style={{ background: '#2a2a40', width: '55%' }} />
      </div>
    </div>
  )
}

function EmptyCard({ rank }: { rank: number }) {
  return (
    <div className="rounded-lg flex flex-col" style={{ border: '1px dashed #2a2a40' }}>
      <div className="relative flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
        <span className="text-lg font-bold" style={{ color: '#2a2a40' }}>#{rank}</span>
      </div>
      <div className="px-2 py-1.5 space-y-1.5">
        <div className="h-2.5 rounded" style={{ background: '#1a1a2e', width: '80%' }} />
        <div className="h-2 rounded" style={{ background: '#1a1a2e', width: '55%' }} />
      </div>
    </div>
  )
}

type Step = 1 | 2 | 3 | null

export default function B30Grid() {
  const [scores, setScores] = useState<UserScoreWithSong[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [step, setStep] = useState<Step>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null)

  async function fetchScores() {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setScores(data.scores ?? [])
      setFetchError(false)
    } catch {
      setFetchError(true)
      toast.error('Could not load scores. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchScores() }, [])

  function closeModal() {
    setStep(null)
    setSelectedSong(null)
    setSelectedDiff(null)
  }

  async function handleScoreSuccess() {
    closeModal()
    toast.success('Score saved!')
    await fetchScores()
  }

  const slots = Array.from({ length: SLOTS }, (_, i) => scores[i] ?? null)
  const isEmpty = !loading && !fetchError && scores.length === 0

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <StatsBar scores={scores} onAdd={() => setStep(1)} />

      {/* Empty state hint for new users */}
      {isEmpty && (
        <div
          className="rounded-xl py-12 text-center"
          style={{ border: '1px dashed #2a2a40' }}
        >
          <p className="text-slate-300 font-medium mb-1">No scores yet</p>
          <p className="text-slate-500 text-sm">Click "+ 添加成绩" to record your first score.</p>
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="rounded-xl py-10 text-center" style={{ border: '1px dashed #450a0a' }}>
          <p className="text-red-400 text-sm">Failed to load scores.</p>
          <button
            onClick={() => { setLoading(true); fetchScores() }}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Grid — shown while loading or when scores exist */}
      {!fetchError && (loading || scores.length > 0) && (
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(6, minmax(130px, 1fr))', minWidth: '840px' }}
          >
            {loading
              ? Array.from({ length: SLOTS }, (_, i) => <SkeletonCard key={i} />)
              : slots.map((score, i) =>
                  score
                    ? <ScoreCard key={score.id} score={score} rank={i + 1} />
                    : <EmptyCard key={`e-${i}`} rank={i + 1} />
                )
            }
          </div>
        </div>
      )}

      {step === 1 && (
        <SearchModal
          onSelect={song => { setSelectedSong(song); setStep(2) }}
          onClose={closeModal}
        />
      )}

      {step === 2 && selectedSong && (
        <DifficultyModal
          song={selectedSong}
          onSelect={diff => { setSelectedDiff(diff); setStep(3) }}
          onBack={() => setStep(1)}
          onClose={closeModal}
        />
      )}

      {step === 3 && selectedSong && selectedDiff && (
        <ScoreModal
          song={selectedSong}
          difficulty={selectedDiff}
          onSuccess={handleScoreSuccess}
          onBack={() => setStep(2)}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
