'use client'

import { useEffect } from 'react'

interface Props {
  step: 1 | 2 | 3
  stepLabel: string
  onBack: () => void
  onClose: () => void
  children: React.ReactNode
}

export default function ModalShell({ step, stepLabel, onBack, onClose, children }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="w-full max-w-lg rounded-xl flex flex-col"
        style={{ background: '#18182a', border: '1px solid #2a2a40', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid #2a2a40' }}
        >
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded text-lg leading-none"
            aria-label="Back"
          >
            ←
          </button>
          <p className="flex-1 text-sm text-slate-300 text-center">
            Step {step} / 3 — {stepLabel}
          </p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
