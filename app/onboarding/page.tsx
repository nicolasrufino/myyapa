'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'
import { SCHOOL_DOMAINS, SCHOOL_LOGO_OVERRIDES } from '@/lib/schoolLogos'
import { useTheme } from '@/lib/context/ThemeContext'

const CATEGORIES = [
  { value: 'food', label: 'Food', desc: 'Restaurants & eats' },
  { value: 'coffee', label: 'Coffee', desc: 'Cafés & study spots' },
  { value: 'drinks', label: 'Drinks', desc: 'Boba, juice & more' },
  { value: 'museums', label: 'Museums', desc: 'Free & discounted' },
  { value: 'sports', label: 'Sports', desc: 'Games & events' },
  { value: 'theater', label: 'Theater', desc: 'Shows & performances' },
]

const STEPS = ['campuses', 'categories'] as const
type Step = typeof STEPS[number]

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('campuses')
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [campusSearch, setCampusSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  )

  const filteredCampuses = CHICAGO_CAMPUSES.filter(c => {
    const q = campusSearch.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.university.toLowerCase().includes(q) ||
      c.aliases?.some(a => a.toLowerCase().includes(q))
    )
  })

  const toggleCampus = (id: string) => {
    setSelectedCampuses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    )
  }

  const savePreferences = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({
        preferred_campuses: selectedCampuses,
        preferred_categories: selectedCategories,
      }).eq('id', user.id)
    }
    setSaving(false)
  }

  const sendEduVerification = async () => {
    if (!eduEmail.endsWith('.edu')) {
      setEduError('Must be a .edu email address')
      return
    }
    setEduError('')
    setEduLoading(true)

    // Save edu email to users table
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({
        edu_email: eduEmail,
        edu_verified: false,
      }).eq('id', user.id)
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: eduEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/edu-confirm`
      }
    })

    if (error) setEduError(error.message)
    else setEduPending(true)
    setEduLoading(false)
  }

  const skip = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({
        preferred_campuses: selectedCampuses,
        preferred_categories: selectedCategories,
      }).eq('id', user.id)
    }
    setSaving(false)
    router.push('/map')
  }

  const nextStep = async () => {
    if (step === 'campuses') {
      setStep('categories')
    } else if (step === 'categories') {
      // final step, save preferences and redirect
      await savePreferences()
      router.push('/map')
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm)', background: 'var(--bg)' }}>

      {/* Line art background */}
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

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-4">
        <div className="text-center mb-2">
          <span style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
            className="text-2xl">
            my<span style={{ color: '#9D00FF' }}>Yapa</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: STEPS.indexOf(step) >= i ? '#9D00FF' : 'var(--border)'
              }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 px-6 py-4 overflow-y-auto">

        {/* STEP 1 — Campuses */}
        {step === 'campuses' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-2xl mb-1 text-center">
              Which campuses are you at?
            </h1>
            <p className="text-sm mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              Select all that apply — we'll show you deals near them.
            </p>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-full px-4 py-3 mb-4"
              style={{ background: 'var(--bg-secondary)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search your school..."
                value={campusSearch}
                onChange={e => setCampusSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Selected chips */}
            {selectedCampuses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCampuses.map(id => {
                  const campus = CHICAGO_CAMPUSES.find(c => c.id === id)
                  return campus ? (
                    <button
                      key={id}
                      onClick={() => toggleCampus(id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ background: '#9D00FF' }}>
                      {campus.name} ✕
                    </button>
                  ) : null
                })}
              </div>
            )}

            {/* Campus grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...filteredCampuses].sort((a, b) => {
                const PINNED = ['northwestern', 'uchicago', 'uic', 'depaul-loop', 'depaul-lincoln-park']
                const aPin = PINNED.indexOf(a.id)
                const bPin = PINNED.indexOf(b.id)
                if (aPin !== -1 && bPin !== -1) return aPin - bPin
                if (aPin !== -1) return -1
                if (bPin !== -1) return 1
                return a.name.localeCompare(b.name)
              }).map(campus => (
                <button
                  key={campus.id}
                  onClick={() => toggleCampus(campus.id)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center"
                  style={{
                    borderColor: selectedCampuses.includes(campus.id) ? '#9D00FF' : 'var(--border)',
                    background: selectedCampuses.includes(campus.id) ? 'var(--card)' : 'var(--bg-secondary)'
                  }}>
                  {selectedCampuses.includes(campus.id) && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#9D00FF' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border"
                    style={{
                      background: theme === 'dark' ? 'var(--bg-secondary)' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'var(--border)'
                    }}>
                    {['american-islamic', 'national-louis', 'chicago-state', 'north-park', 'college-lake-county'].includes(campus.id) ? (
                      <span className="text-xs font-bold" style={{ color: '#9D00FF' }}>
                        {campus.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                      </span>
                    ) : (
                      <>
                        <img
                          src={SCHOOL_LOGO_OVERRIDES[campus.id] || `https://www.google.com/s2/favicons?domain=${SCHOOL_DOMAINS[campus.id]}&sz=64`}
                          alt={campus.name}
                          className="w-10 h-10 object-contain"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            const sib = e.currentTarget.nextElementSibling as HTMLElement | null
                            if (sib) sib.style.display = 'block'
                          }}
                        />
                        <span style={{ display: 'none', color: '#9D00FF' }} className="text-xs font-bold">
                          {campus.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{campus.name}</div>
                    <div className="text-xs mt-0.5 leading-tight line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{campus.university}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Categories */}
        {step === 'categories' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-2xl mb-1 text-center">
              What are you into?
            </h1>
            <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              We'll show you the most relevant deals first.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className="relative flex flex-col items-start gap-1 px-4 py-4 rounded-2xl border transition-all text-left"
                  style={{
                    borderColor: selectedCategories.includes(cat.value) ? '#9D00FF' : 'var(--border)',
                    background: selectedCategories.includes(cat.value) ? 'var(--card)' : 'var(--bg-secondary)'
                  }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cat.desc}</span>
                  {selectedCategories.includes(cat.value) && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#9D00FF' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}

            </div>

            <div className="mt-6 flex items-center justify-between px-4 py-4 rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  style={{ color: '#9D00FF', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark mode</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Easier on the eyes at night</div>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !darkMode
                  setDarkMode(next)
                  setTheme(next ? 'dark' : 'light')
                }}
                className="w-12 h-6 rounded-full transition-all relative shrink-0"
                style={{ background: darkMode ? '#9D00FF' : 'var(--border)' }}>
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ left: darkMode ? '26px' : '4px' }} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — .edu verification */}
        {step === 'edu' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-2xl mb-1 text-center">
              Verify your student status
            </h1>
            <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              Add your .edu email to unlock rewards, your Yapa pass, and exclusive student pricing.
            </p>

            {eduPending ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                  <svg width="28" height="28" fill="none" stroke="#9D00FF" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Check your inbox!</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  We sent a verification link to <strong>{eduEmail}</strong>
                </p>
                <button
                  onClick={() => setEduPending(false)}
                  className="text-xs underline"
                  style={{ color: '#9D00FF' }}>
                  Use a different email
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="yourname@university.edu"
                  value={eduEmail}
                  onChange={e => setEduEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendEduVerification() }}
                  className="w-full border rounded-full px-5 py-4 text-sm outline-none focus:border-[#9D00FF] transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
                {eduError && (
                  <p className="text-xs text-red-500 px-2">{eduError}</p>
                )}
                {!eduError && eduEmail && !eduEmail.endsWith('.edu') && (
                  <p className="text-xs text-red-500 px-2">Must be a .edu email</p>
                )}
                <button
                  onClick={sendEduVerification}
                  disabled={!eduEmail.endsWith('.edu') || eduLoading}
                  className="w-full text-white rounded-full px-6 py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#9D00FF' }}>
                  {eduLoading ? 'Sending...' : 'Verify my .edu →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom actions — always visible */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 border-t z-20"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {step === 'categories' ? (
          <>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('campuses')}
                className="flex-1 rounded-full py-4 text-sm font-bold border hover:bg-[var(--bg-secondary)] dark:hover:bg-white/10 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                ← Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 text-white rounded-full py-4 text-sm font-bold hover:brightness-90 transition-all"
                style={{ background: '#9D00FF' }}>
                Done
              </button>
            </div>
            <button onClick={skip}
              className="w-full rounded-full py-4 text-sm font-bold border mt-3 hover:bg-[var(--bg-secondary)] dark:hover:bg-white/10 transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              Skip setup
            </button>
          </>
        ) : (
          <>
            <button
              onClick={nextStep}
              className="w-full text-white rounded-full py-4 text-sm font-bold hover:brightness-90 transition-all"
              style={{ background: '#9D00FF' }}>
              {step === 'campuses' && selectedCampuses.length > 0
                ? `Continue with ${selectedCampuses.length} campus${selectedCampuses.length > 1 ? 'es' : ''} →`
                : 'Continue →'}
            </button>
            {step === 'campuses' && (
              <button onClick={skip}
                className="w-full rounded-full py-4 text-sm font-bold border mt-3 hover:bg-[var(--bg-secondary)] dark:hover:bg-white/10 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Skip setup
              </button>
            )}
          </>
        )}
      </div>

      {/* Add padding at bottom so content doesn't hide behind fixed bar */}
      <div className="h-32" />

    </main>
  )
}
