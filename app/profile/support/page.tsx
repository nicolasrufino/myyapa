'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/context/ThemeContext'
import Link from 'next/link'

const ISSUE_TYPES = [
  'App bug or crash',
  'Wrong place information',
  'Discount not honored',
  'Account issue',
  'Suggestion or feedback',
  'Other',
]

export default function SupportPage() {
  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()
  const { theme } = useTheme()

  const submit = async () => {
    if (!type || !message.trim()) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('support_tickets').insert({
      user_id: user?.id || null,
      type,
      message,
    })
    setSent(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Profile
        </Link>
      </div>

      <div className="px-5 pb-10">
        {sent ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: '#f5f0ff' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9D00FF" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-bold text-xl" style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
              Got it, thanks!
            </p>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              We'll look into it and get back to you if needed.
            </p>
            <Link href="/profile"
              className="mt-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: '#9D00FF' }}>
              Back to profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mt-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Something wrong? Let us know and we'll take care of it.
            </p>

            {/* Issue type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>What's the issue?</label>
              <div className="flex flex-col gap-2">
                {ISSUE_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="px-4 py-3 rounded-2xl border text-sm text-left font-semibold transition-all"
                    style={{
                      borderColor: type === t ? '#9D00FF' : 'var(--border)',
                      background: type === t ? (theme === 'dark' ? '#2a1a4a' : '#f5f0ff') : 'var(--card)',
                      color: type === t ? '#9D00FF' : 'var(--text-primary)'
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>Tell us more</label>
              <textarea
                placeholder="Describe what happened..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none border resize-none"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <button onClick={submit} disabled={!type || !message.trim() || submitting}
              className="w-full py-4 rounded-full font-bold text-white disabled:opacity-40 transition-all"
              style={{ background: '#9D00FF' }}>
              {submitting ? 'Sending...' : 'Send to Yapa team →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
