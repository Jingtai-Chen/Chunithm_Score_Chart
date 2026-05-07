'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  )
}

function PasswordField({
  label, value, onChange, show, onToggle, placeholder, minLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
  minLength?: number
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={minLength}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-10 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
          style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
          placeholder={placeholder ?? '••••••••'}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const confirmMismatch = confirm.length > 0 && confirm !== password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      setError('Username already taken.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })

      if (profileError) {
        // 23505 = unique_violation: username already taken — surface this to the user.
        // Any other error (e.g. RLS blocks insert before email confirmation) is non-fatal:
        // the auth/callback route will create the profile once the user confirms their email.
        if (profileError.code === '23505') {
          setError('Username already taken.')
          setLoading(false)
          return
        }
      }
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f0f1a' }}>
        <div className="w-full max-w-sm rounded-xl p-8 text-center" style={{ background: '#18182a', border: '1px solid #2a2a40' }}>
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm">
            We sent a confirmation link to <span className="text-white">{email}</span>.
            Click it to activate your account, then{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">sign in</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f0f1a' }}>
      <div className="w-full max-w-sm rounded-xl p-8" style={{ background: '#18182a', border: '1px solid #2a2a40' }}>
        <h1 className="text-2xl font-bold text-white mb-2">CHUNITHM Tracker</h1>
        <p className="text-slate-400 mb-8 text-sm">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
              placeholder="YourUsername"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: '#0f0f1a', border: '1px solid #2a2a40' }}
              placeholder="you@example.com"
            />
          </div>

          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggle={() => setShowPassword(v => !v)}
            minLength={6}
          />

          <div>
            <PasswordField
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
            />
            {confirmMismatch && (
              <p className="mt-1.5 text-red-400 text-xs">Passwords do not match.</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || confirmMismatch}
            className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-50"
            style={{ background: '#7c3aed' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
