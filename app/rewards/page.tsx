'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

const FEATURE_CONFIG: Record<string, { emoji: string; type: string; label: string }> = {
  rewards: { emoji: '🎁', type: 'rewards', label: 'Rewards & points' },
  app: { emoji: '📱', type: 'app', label: 'The app' },
  saved: { emoji: '🔖', type: 'saved', label: 'Saved places' },
  reviews: { emoji: '⭐', type: 'reviews', label: 'My reviews' },
  orders: { emoji: '🧾', type: 'orders', label: 'Order history' },
  add: { emoji: '📍', type: 'add', label: 'Add a place' },
  support: { emoji: '💬', type: 'support', label: 'Support' },
  account: { emoji: '⚙️', type: 'account', label: 'Account settings' },
}

function ComingSoonContent() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const featureKey = searchParams.get('feature') ?? 'rewards'
  const config = FEATURE_CONFIG[featureKey] ?? FEATURE_CONFIG.rewards

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('waitlist').insert({ email, type: config.type })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm)', background: 'var(--bg)' }}>

      {/* Nav */}
      <div className="flex items-center px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-all"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* SVG line background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 right-0 opacity-40" style={{ width: '28rem', height: '28rem' }} viewBox="0 0 400 400">
          <path d="M 300 0 Q 400 100 350 200 Q 300 300 400 400" fill="none" stroke="#7a00cc" strokeWidth="2.5"/>
          <path d="M 350 0 Q 450 150 380 250 Q 320 350 420 400" fill="none" stroke="#7a00cc" strokeWidth="2"/>
          <path d="M 400 50 Q 480 200 420 300 Q 360 400 450 450" fill="none" stroke="#5a0099" strokeWidth="1.5"/>
          <path d="M 250 0 Q 370 80 310 180 Q 260 270 370 360" fill="none" stroke="#7a00cc" strokeWidth="1.5"/>
          <path d="M 200 0 Q 340 60 270 160 Q 210 240 330 320" fill="none" stroke="#9D00FF" strokeWidth="1"/>
        </svg>
        <svg className="absolute bottom-0 left-0 opacity-40" style={{ width: '28rem', height: '28rem' }} viewBox="0 0 400 400">
          <path d="M 100 400 Q 0 300 50 200 Q 100 100 0 0" fill="none" stroke="#7a00cc" strokeWidth="2.5"/>
          <path d="M 50 400 Q -50 250 20 150 Q 80 50 -20 0" fill="none" stroke="#7a00cc" strokeWidth="2"/>
          <path d="M 0 350 Q -80 200 -20 100 Q 40 0 -50 -50" fill="none" stroke="#5a0099" strokeWidth="1.5"/>
          <path d="M 150 400 Q 30 320 90 220 Q 140 130 30 40" fill="none" stroke="#7a00cc" strokeWidth="1.5"/>
          <path d="M 200 400 Q 60 340 130 240 Q 190 160 70 80" fill="none" stroke="#9D00FF" strokeWidth="1"/>
        </svg>
        <svg className="absolute top-0 left-0 opacity-40" style={{ width: '22rem', height: '22rem' }} viewBox="0 0 400 400">
          <path d="M 0 100 Q 80 50 100 0" fill="none" stroke="#7a00cc" strokeWidth="2"/>
          <path d="M 0 160 Q 120 90 150 0" fill="none" stroke="#7a00cc" strokeWidth="1.5"/>
          <path d="M 0 220 Q 150 130 190 0" fill="none" stroke="#5a0099" strokeWidth="1"/>
        </svg>
        <svg className="absolute bottom-0 right-0 opacity-40" style={{ width: '22rem', height: '22rem' }} viewBox="0 0 400 400">
          <path d="M 400 300 Q 320 350 300 400" fill="none" stroke="#7a00cc" strokeWidth="2"/>
          <path d="M 400 240 Q 280 310 250 400" fill="none" stroke="#7a00cc" strokeWidth="1.5"/>
          <path d="M 400 180 Q 250 270 210 400" fill="none" stroke="#5a0099" strokeWidth="1"/>
        </svg>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
      <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center gap-6">
        <Link href="/" style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
          className="text-2xl">
          my<span style={{ color: '#9D00FF' }}>Yapa</span>
        </Link>

        <div className="text-6xl">{config.emoji}</div>

        <div>
          <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
            className="text-3xl mb-2">
            Coming soon
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {config.label} is on the way — we're working hard to get it ready. Drop your email and we'll let you know the moment it's live.
          </p>
        </div>

        {submitted ? (
          <div className="w-full bg-purple-50 border border-purple-200 rounded-2xl px-6 py-4">
            <p className="text-sm font-semibold text-purple-700">You're on the list! 🎉</p>
            <p className="text-xs text-purple-500 mt-1">We'll email you as soon as it's ready.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Get notified when it's ready</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-full px-5 py-4 text-sm outline-none focus:border-[#9D00FF] transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full text-white rounded-full py-4 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: '#9D00FF' }}>
              {loading ? 'Subscribing...' : 'Notify me →'}
            </button>
          </div>
        )}

      </div>
      </div>
    </main>
  )
}

export default function ComingSoonPage() {
  return (
    <Suspense>
      <ComingSoonContent />
    </Suspense>
  )
}
