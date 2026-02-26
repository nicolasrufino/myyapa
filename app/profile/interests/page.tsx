'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'food', label: 'Food', desc: 'Restaurants & eats' },
  { value: 'coffee', label: 'Coffee', desc: 'Cafés & study spots' },
  { value: 'drinks', label: 'Drinks', desc: 'Boba, juice & more' },
  { value: 'museums', label: 'Museums', desc: 'Free & discounted' },
  { value: 'sports', label: 'Sports', desc: 'Games & events' },
  { value: 'theater', label: 'Theater', desc: 'Shows & performances' },
]

export default function EditInterestsPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('preferred_categories')
        .eq('id', user.id)
        .single()
      if (data?.preferred_categories) setSelected(data.preferred_categories)
    }
    load()
  }, [])

  const toggle = (value: string) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    )
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users')
        .update({ preferred_categories: selected })
        .eq('id', user.id)
    }
    setSaving(false)
    router.push('/profile')
  }

  return (
    <main className="min-h-screen pb-32"
      style={{ background: 'var(--bg-secondary)', fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="flex items-center px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-all"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          My Interests
        </Link>
      </div>

      <div className="px-6 py-6">
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Select what you're into — we'll show the most relevant deals first.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => toggle(cat.value)}
              className="relative flex flex-col items-start gap-1 px-4 py-4 rounded-2xl border transition-all text-left"
              style={{
                borderColor: selected.includes(cat.value) ? '#9D00FF' : 'var(--border)',
                background: selected.includes(cat.value) ? 'var(--card)' : 'var(--bg-secondary)'
              }}>
              <span className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
              <span className="text-xs"
                style={{ color: 'var(--text-secondary)' }}>{cat.desc}</span>
              {selected.includes(cat.value) && (
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
      </div>

      {/* Fixed save button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 border-t"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <button
          onClick={save}
          disabled={saving}
          className="w-full text-white rounded-full py-4 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: '#9D00FF' }}>
          {saving ? 'Saving...' : 'Save interests →'}
        </button>
      </div>
    </main>
  )
}
