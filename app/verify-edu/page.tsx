'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function VerifyEduPage() {
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [eduEmail, setEduEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const sendCode = async () => {
    if (!eduEmail.endsWith('.edu')) {
      setError('Must be a .edu email address')
      return
    }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to verify your student email.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/send-edu-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eduEmail, userId: user.id }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Failed to send code. Try again.')
    } else {
      setStep('code')
    }
    setLoading(false)
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please log in again.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/verify-edu-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, code }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Incorrect code. Try again.')
    } else {
      setStep('done')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-6">
        <Link href="/profile" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }} className="text-2xl">
          Student Verification
        </h1>
      </div>

      <div className="px-5 pb-10">

        {/* DONE */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9D00FF" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-bold text-xl" style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
              You're verified!
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your student status has been confirmed. You now have access to all student perks on Yapa.
            </p>
            <Link href="/profile"
              className="mt-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: '#9D00FF' }}>
              Back to profile
            </Link>
          </div>
        )}

        {/* STEP 1 — Email */}
        {step === 'email' && (
          <div className="flex flex-col gap-5 mt-2">
            <div className="rounded-2xl p-4 flex gap-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9D00FF" strokeWidth="1.5" className="shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Add your <strong style={{ color: 'var(--text-primary)' }}>.edu email</strong> to unlock rewards, your Yapa pass, and exclusive student pricing. We'll send a 6-digit code to confirm.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>Your .edu email</label>
              <input
                type="email"
                placeholder="yourname@university.edu"
                value={eduEmail}
                onChange={e => { setEduEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
                className="w-full border rounded-full px-5 py-4 text-sm outline-none transition-all"
                style={{
                  borderColor: error ? '#ef4444' : 'var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text-primary)'
                }}
              />
              {error && <p className="text-xs text-red-500 px-2">{error}</p>}
              {!error && eduEmail && !eduEmail.endsWith('.edu') && (
                <p className="text-xs text-red-500 px-2">Must be a .edu email</p>
              )}
            </div>

            <button
              onClick={sendCode}
              disabled={!eduEmail.endsWith('.edu') || loading}
              className="w-full text-white rounded-full py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#9D00FF' }}>
              {loading ? 'Sending code...' : 'Send verification code →'}
            </button>
          </div>
        )}

        {/* STEP 2 — Code */}
        {step === 'code' && (
          <div className="flex flex-col gap-5 mt-2">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border)' }}>
                <svg width="24" height="24" fill="none" stroke="#9D00FF" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Check your inbox</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{eduEmail}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>Enter 6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="••••••"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && verifyCode()}
                className="w-full border rounded-full px-5 py-4 text-center text-xl font-bold tracking-widest outline-none transition-all"
                style={{
                  borderColor: error ? '#ef4444' : 'var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text-primary)'
                }}
              />
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </div>

            <button
              onClick={verifyCode}
              disabled={code.length !== 6 || loading}
              className="w-full text-white rounded-full py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#9D00FF' }}>
              {loading ? 'Verifying...' : 'Confirm code →'}
            </button>

            <button
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              className="text-xs text-center underline"
              style={{ color: 'var(--text-secondary)' }}>
              Use a different email
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
