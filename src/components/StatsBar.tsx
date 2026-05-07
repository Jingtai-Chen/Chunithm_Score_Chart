import type { UserScoreWithSong } from '@/types'

interface Props {
  scores: UserScoreWithSong[]
  onAdd: () => void
}

export default function StatsBar({ scores, onAdd }: Props) {
  const top30 = scores.slice(0, 30)
  const b30Rating = top30.length > 0
    ? top30.reduce((sum, s) => sum + s.song_rating, 0) / top30.length
    : 0
  const fcCount  = scores.filter(s => s.lamp === 'FC').length
  const ajCount  = scores.filter(s => s.lamp === 'AJ').length
  const ajcCount = scores.filter(s => s.lamp === 'AJC').length

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div>
        <p className="text-xs text-slate-400 mb-0.5">B30 Rating</p>
        <p className="text-3xl font-bold tabular-nums" style={{ color: '#a78bfa' }}>
          {b30Rating.toFixed(2)}
        </p>
      </div>

      <div className="self-stretch w-px hidden sm:block" style={{ background: '#2a2a40' }} />

      <div>
        <p className="text-xs text-slate-400 mb-0.5">Total Scores</p>
        <p className="text-xl font-bold text-white tabular-nums">{scores.length}</p>
      </div>

      <div className="self-stretch w-px hidden sm:block" style={{ background: '#2a2a40' }} />

      <div>
        <p className="text-xs text-slate-400 mb-0.5">FC</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: '#4ade80' }}>{fcCount}</p>
      </div>

      <div className="self-stretch w-px hidden sm:block" style={{ background: '#2a2a40' }} />

      <div>
        <p className="text-xs text-slate-400 mb-0.5">AJ</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: '#a78bfa' }}>{ajCount}</p>
      </div>

      <div className="self-stretch w-px hidden sm:block" style={{ background: '#2a2a40' }} />

      <div>
        <p className="text-xs text-slate-400 mb-0.5">AJC</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: '#fbbf24' }}>{ajcCount}</p>
      </div>

      <button
        onClick={onAdd}
        className="ml-auto px-4 py-2 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-80"
        style={{ background: '#7c3aed' }}
      >
        + 添加成绩
      </button>
    </div>
  )
}
