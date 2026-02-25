'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'

const CATEGORIES = [
  { value: 'food', label: 'Food', desc: 'Restaurants & eats' },
  { value: 'coffee', label: 'Coffee', desc: 'Cafés & study spots' },
  { value: 'drinks', label: 'Drinks', desc: 'Boba, juice & more' },
  { value: 'museums', label: 'Museums', desc: 'Free & discounted' },
  { value: 'sports', label: 'Sports', desc: 'Games & events' },
  { value: 'theater', label: 'Theater', desc: 'Shows & performances' },
]

const STEPS = ['campuses', 'categories', 'edu'] as const
type Step = typeof STEPS[number]

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('campuses')
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [campusSearch, setCampusSearch] = useState('')
  const [eduEmail, setEduEmail] = useState('')
  const [eduPending, setEduPending] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredCampuses = CHICAGO_CAMPUSES.filter(c =>
    c.name.toLowerCase().includes(campusSearch.toLowerCase()) ||
    c.university.toLowerCase().includes(campusSearch.toLowerCase())
  )

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
    if (!eduEmail.endsWith('.edu')) return
    await supabase.auth.signInWithOtp({
      email: eduEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/edu-confirm`
      }
    })
    setEduPending(true)
  }

  const skip = async () => {
    await savePreferences()
    router.push('/map')
  }

  const nextStep = async () => {
    if (step === 'campuses') setStep('categories')
    else if (step === 'categories') setStep('edu')
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm)', background: '#fafafa' }}>

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 right-0 w-96 h-96 opacity-10" viewBox="0 0 400 400">
          <path d="M 300 0 Q 400 100 350 200 Q 300 300 400 400" fill="none" stroke="#9D00FF" strokeWidth="2"/>
          <path d="M 350 0 Q 450 150 380 250 Q 320 350 420 400" fill="none" stroke="#9D00FF" strokeWidth="1.5"/>
          <path d="M 400 50 Q 480 200 420 300 Q 360 400 450 450" fill="none" stroke="#7a00cc" strokeWidth="1"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-80 h-80 opacity-10" viewBox="0 0 400 400">
          <path d="M 0 300 Q 100 200 50 100 Q 0 0 100 -50" fill="none" stroke="#9D00FF" strokeWidth="2"/>
          <path d="M -50 350 Q 80 250 30 150 Q -20 50 80 0" fill="none" stroke="#9D00FF" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" fill="none" stroke="#9D00FF" strokeWidth="1"/>
          <circle cx="200" cy="200" r="100" fill="none" stroke="#9D00FF" strokeWidth="1"/>
          <circle cx="200" cy="200" r="50" fill="none" stroke="#9D00FF" strokeWidth="1"/>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-4">
        <span style={{ fontFamily: 'var(--font-viga)' }}
          className="text-2xl text-gray-900">
          my<span style={{ color: '#9D00FF' }}>Yapa</span>
        </span>

        {/* Progress bar */}
        <div className="flex gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: STEPS.indexOf(step) >= i ? '#9D00FF' : '#e5e7eb'
              }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 px-6 py-4 overflow-y-auto">

        {/* STEP 1 — Campuses */}
        {step === 'campuses' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-2xl text-gray-900 mb-1">
              Which campuses are you at?
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              Select all that apply — we'll show you deals near them.
            </p>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3 mb-4">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search your school..."
                value={campusSearch}
                onChange={e => setCampusSearch(e.target.value)}
                className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
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

            {/* Campus list */}
            <div className="flex flex-col gap-2">
              {filteredCampuses.map(campus => (
                <button
                  key={campus.id}
                  onClick={() => toggleCampus(campus.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left"
                  style={{
                    borderColor: selectedCampuses.includes(campus.id) ? '#9D00FF' : '#e5e7eb',
                    background: selectedCampuses.includes(campus.id) ? '#f5f0ff' : 'white'
                  }}>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 bg-gray-50">
                    <span className="text-sm">🎓</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{campus.name}</div>
                    <div className="text-xs text-gray-500">{campus.university}</div>
                  </div>
                  {selectedCampuses.includes(campus.id) && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#9D00FF' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Categories */}
        {step === 'categories' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-2xl text-gray-900 mb-1">
              What are you into?
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              We'll show you the most relevant deals first.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className="relative flex flex-col items-start gap-1 px-4 py-4 rounded-2xl border transition-all text-left"
                  style={{
                    borderColor: selectedCategories.includes(cat.value) ? '#9D00FF' : '#e5e7eb',
                    background: selectedCategories.includes(cat.value) ? '#f5f0ff' : 'white'
                  }}>
                  <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                  <span className="text-xs text-gray-500">{cat.desc}</span>
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
          </>
        )}

        {/* STEP 3 — .edu verification */}
        {step === 'edu' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-2xl text-gray-900 mb-1">
              Verify your student status
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Add your .edu email to unlock rewards, your Yapa pass, and exclusive student pricing.
            </p>

            {eduPending ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="text-4xl">📬</div>
                <p className="text-sm font-semibold text-gray-900">Check your inbox!</p>
                <p className="text-xs text-gray-600">
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
                  className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
                />
                {eduEmail && !eduEmail.endsWith('.edu') && (
                  <p className="text-xs text-red-500 px-2">Must be a .edu email</p>
                )}
                <button
                  onClick={sendEduVerification}
                  disabled={!eduEmail.endsWith('.edu')}
                  className="w-full text-white rounded-full px-6 py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#9D00FF' }}>
                  Verify my .edu →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="relative z-10 px-6 py-6 border-t border-gray-100 flex flex-col gap-3 bg-white/80 backdrop-blur-sm">
        {step !== 'edu' ? (
          <button
            onClick={nextStep}
            className="w-full text-white rounded-full py-4 text-sm font-bold hover:opacity-90 transition-all"
            style={{ background: '#9D00FF' }}>
            {step === 'campuses'
              ? selectedCampuses.length > 0
                ? `Continue with ${selectedCampuses.length} campus${selectedCampuses.length > 1 ? 'es' : ''} →`
                : 'Continue →'
              : selectedCategories.length > 0
                ? `Continue with ${selectedCategories.length} interest${selectedCategories.length > 1 ? 's' : ''} →`
                : 'Continue →'
            }
          </button>
        ) : (
          <button
            onClick={skip}
            disabled={saving}
            className="w-full border border-gray-200 rounded-full py-4 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Skip for now, explore the map →'}
          </button>
        )}

        {step !== 'campuses' && (
          <button
            onClick={() => setStep(step === 'categories' ? 'campuses' : 'categories')}
            className="text-xs text-center text-gray-400 hover:text-gray-600">
            ← Back
          </button>
        )}

        {step === 'campuses' && (
          <button onClick={skip}
            className="text-xs text-center text-gray-400 hover:text-gray-600">
            Skip setup
          </button>
        )}
      </div>

    </main>
  )
}
