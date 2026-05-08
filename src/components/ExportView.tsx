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
const INFO_H = 92    // tall enough for 2-line title + diff/grade row + score

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

                {/*
                  Overlay: full-size flex column over the cover.
                  Uses justify-content:space-between so the top row (rank+lamp)
                  and bottom row (rating) sit in the correct corners without
                  relying on `bottom` or `right` absolute values, which
                  html2canvas can miscompute.
                */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: `${CARD_W}px`, height: `${COVER_H}px`,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  padding: '7px',
                }}>
                  {/* Top row: rank badge (left) + lamp dot (right) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      background: isTop3 ? '#7c3aed' : 'rgba(0,0,0,0.65)',
                      color: isTop3 ? '#fff' : '#94a3b8',
                    }}>
                      {i + 1}
                    </div>
                    {score.lamp !== 'NONE' ? (
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%', marginTop: '7px',
                        background: score.lamp === 'AJC' || score.lamp === 'AJ' ? '#a78bfa' : '#4ade80',
                      }} />
                    ) : <div />}
                  </div>

                  {/* Bottom row: rating pill (right-aligned) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 700,
                      padding: '3px 7px', borderRadius: '5px',
                      background: 'rgba(0,0,0,0.75)', color: '#a78bfa',
                    }}>
                      {score.song_rating.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info section — flex column with fixed gap, no space-between */}
              <div style={{
                height: `${INFO_H}px`,
                padding: '7px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}>
                {/* Title — 2-line block; fixed height clips overflow without ellipsis tricks */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '1.35',
                  height: '33px',       /* 12px × 1.35 × 2 lines ≈ 32.4px */
                  overflow: 'hidden',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
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
