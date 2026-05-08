'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { UserScoreWithSong, Song, Difficulty } from '@/types'
import ScoreCard from './ScoreCard'
import StatsBar from './StatsBar'
import SearchModal from './modals/SearchModal'
import DifficultyModal from './modals/DifficultyModal'
import ScoreModal from './modals/ScoreModal'
import ExportView from './ExportView'

const COVER_BASE = 'https://dp4p6x0xfi5o9.cloudfront.net/chunithm/img/cover'
const SLOTS = 30

export type B30GridHandle = { triggerExport: () => void }

interface Props {
  username: string
  onExportingChange?: (v: boolean) => void
}

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

const B30Grid = forwardRef<B30GridHandle, Props>(function B30Grid({ username, onExportingChange }, ref) {
  const [scores, setScores] = useState<UserScoreWithSong[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [step, setStep] = useState<Step>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null)

  const [exporting, setExporting] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [coverDataUrls, setCoverDataUrls] = useState<Record<string, string>>({})
  const exportRef = useRef<HTMLDivElement>(null)

  // Keep a ref to handleExport so useImperativeHandle never goes stale
  const handleExportRef = useRef<() => void>(() => {})

  useEffect(() => { onExportingChange?.(exporting) }, [exporting, onExportingChange])

  useImperativeHandle(ref, () => ({
    triggerExport: () => handleExportRef.current(),
  }))

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

  // Fire html2canvas once ExportView is rendered with data URLs
  useEffect(() => {
    if (!exportReady || !exportRef.current) return

    let cancelled = false

    async function capture() {
      if (!exportRef.current) return
      try {
        const { default: html2canvas } = await import('html2canvas')
        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          backgroundColor: '#0f0f1a',
          useCORS: false,
          allowTaint: false,
        })
        if (cancelled) return
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const link = document.createElement('a')
        link.download = `b30_${username}_${date}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success('图片已保存！')
      } catch {
        if (!cancelled) toast.error('Export failed. Please try again.')
      } finally {
        if (!cancelled) {
          setExporting(false)
          setExportReady(false)
          setCoverDataUrls({})
        }
      }
    }

    capture()
    return () => { cancelled = true }
  }, [exportReady]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExport() {
    if (exporting) return
    if (scores.length === 0) {
      toast.error('No scores to export.')
      return
    }
    setExporting(true)

    const top30 = scores.slice(0, 30)
    const imageNames = Array.from(new Set(top30.map(s => s.song.image_name).filter(Boolean))) as string[]

    const entries = await Promise.all(
      imageNames.map(async name => {
        try {
          const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(`${COVER_BASE}/${name}`)}`)
          if (!res.ok) return [name, ''] as [string, string]
          const blob = await res.blob()
          const dataUrl = await new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          return [name, dataUrl] as [string, string]
        } catch {
          return [name, ''] as [string, string]
        }
      })
    )

    setCoverDataUrls(Object.fromEntries(entries))
    setExportReady(true)
  }

  // Always point the ref at the latest handleExport closure
  handleExportRef.current = handleExport

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

      {isEmpty && (
        <div className="rounded-xl py-12 text-center" style={{ border: '1px dashed #2a2a40' }}>
          <p className="text-slate-300 font-medium mb-1">No scores yet</p>
          <p className="text-slate-500 text-sm">Click "+ 添加成绩" to record your first score.</p>
        </div>
      )}

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

      {exportReady && (
        <ExportView
          exportRef={exportRef}
          scores={scores}
          username={username}
          coverDataUrls={coverDataUrls}
        />
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
})

export default B30Grid
