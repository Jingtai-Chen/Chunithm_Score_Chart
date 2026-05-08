import type { RefObject } from 'react'
import type { UserScoreWithSong } from '@/types'

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

// 1200px canvas − 64px h-padding − 50px (5×10px gaps) = 1086 / 6 = 181px per card
const CARD_W = 181
const COVER_H = 181  // square cover, explicit px so html2canvas doesn't collapse it
const INFO_H = 78    // fixed info section height: prevents cramping

interface Props {
  exportRef: RefObject<HTMLDivElement>
  scores: UserScoreWithSong[]
  username: string
  coverDataUrls: Record<string, string>
}

export default function ExportView({ exportRef, scores, username, coverDataUrls }: Props) {
  const top30 = scores.slice(0, 30)
  const b30Rating = top30.length > 0
    ? top30.reduce((sum, s) => sum + s.song_rating, 0) / top30.length
    : 0

  const slots = Array.from({ length: 30 }, (_, i) => top30[i] ?? null)

  return (
    <div
      ref={exportRef}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '1200px',
        background: '#0f0f1a',
        padding: '32px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ color: '#a78bfa', fontSize: '14px', marginBottom: '6px', letterSpacing: '0.05em' }}>
            CHUNITHM Tracker
          </div>
          <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{username}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>B30 Rating</div>
          <div style={{ color: '#a78bfa', fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
            {b30Rating.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Grid — explicit column widths so every card is the same size */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(6, ${CARD_W}px)`,
        gap: '10px',
      }}>
        {slots.map((score, i) => {
          if (!score) {
            return (
              <div
                key={`e-${i}`}
                style={{
                  width: `${CARD_W}px`,
                  height: `${COVER_H + INFO_H}px`,
                  borderRadius: '8px',
                  border: '1px dashed #2a2a40',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ color: '#2a2a40', fontSize: '20px', fontWeight: 700 }}>#{i + 1}</span>
              </div>
            )
          }

          const diff = DIFF_STYLE[score.difficulty] ?? DIFF_STYLE.MASTER
          const gradeColor = GRADE_COLOR[score.grade] ?? '#94a3b8'
          const isTop3 = i < 3
          const imgSrc = coverDataUrls[score.song.image_name ?? ''] ?? null

          return (
            <div
              key={score.id}
              style={{
                width: `${CARD_W}px`,
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#18182a',
                border: '1px solid #2a2a40',
                boxSizing: 'border-box',
              }}
            >
              {/* Cover — explicit height, NO aspectRatio (html2canvas ignores it) */}
              <div style={{
                position: 'relative',
                width: `${CARD_W}px`,
                height: `${COVER_H}px`,
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={score.song.title}
                    width={CARD_W}
                    height={COVER_H}
                    style={{ display: 'block', width: `${CARD_W}px`, height: `${COVER_H}px`, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: `${CARD_W}px`, height: `${COVER_H}px`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#0f0f1a', fontSize: '36px',
                  }}>
                    ♪
                  </div>
                )}

                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: '7px', left: '7px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  background: isTop3 ? '#7c3aed' : 'rgba(0,0,0,0.65)',
                  color: isTop3 ? '#fff' : '#94a3b8',
                }}>
                  {i + 1}
                </div>

                {/* Lamp dot */}
                {score.lamp !== 'NONE' && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: score.lamp === 'AJC' || score.lamp === 'AJ' ? '#a78bfa' : '#4ade80',
                  }} />
                )}

                {/* Song rating overlay */}
                <div style={{
                  position: 'absolute', bottom: '7px', right: '7px',
                  fontSize: '13px', fontWeight: 700,
                  padding: '3px 7px', borderRadius: '5px',
                  background: 'rgba(0,0,0,0.75)', color: '#a78bfa',
                }}>
                  {score.song_rating.toFixed(2)}
                </div>
              </div>

              {/* Info section — fixed height to guarantee it's never cut off */}
              <div style={{
                height: `${INFO_H}px`,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}>
                {/* Title */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}>
                  {score.song.title}
                </div>

                {/* Difficulty chip + grade */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    padding: '2px 6px', borderRadius: '4px',
                    background: diff.bg, color: diff.text,
                    border: diff.border ? `1px solid ${diff.border}` : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {score.difficulty}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: gradeColor }}>
                    {score.grade}
                  </span>
                </div>

                {/* Score */}
                <div style={{ color: '#94a3b8', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                  {score.score.toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Watermark */}
      <div style={{ marginTop: '24px', textAlign: 'center', color: '#3a3a55', fontSize: '13px' }}>
        CHUNITHM Tracker
      </div>
    </div>
  )
}
