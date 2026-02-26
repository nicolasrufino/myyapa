'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'
import { SCHOOL_DOMAINS, SCHOOL_LOGO_OVERRIDES } from '@/lib/schoolLogos'
import { useTheme } from '@/lib/context/ThemeContext'
import Link from 'next/link'

const PINNED = ['northwestern', 'uchicago', 'uic', 'depaul-loop', 'depaul-lincoln-park']
const INITIALS_ONLY = ['american-islamic', 'national-louis', 'chicago-state', 'north-park', 'college-lake-county']

export default function EditCampusesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('preferred_campuses')
        .eq('id', user.id)
        .single()
      if (data?.preferred_campuses) setSelected(data.preferred_campuses)
    }
    load()
  }, [])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users')
        .update({ preferred_campuses: selected })
        .eq('id', user.id)
    }
    setSaving(false)
    router.push('/profile')
  }

  const filtered = [...CHICAGO_CAMPUSES].filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.university.toLowerCase().includes(q) ||
      c.aliases?.some(a => a.toLowerCase().includes(q))
    )
  }).sort((a, b) => {
    const aPin = PINNED.indexOf(a.id)
    const bPin = PINNED.indexOf(b.id)
    if (aPin !== -1 && bPin !== -1) return aPin - bPin
    if (aPin !== -1) return -1
    if (bPin !== -1) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="min-h-screen pb-32"
      style={{ background: 'var(--bg-secondary)', fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-all"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          My Campuses
        </Link>
        <span className="text-xs font-semibold" style={{ color: '#9D00FF' }}>
          {selected.length} selected
        </span>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-full px-4 py-3"
          style={{ background: 'var(--card)' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search your school..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map(id => {
              const campus = CHICAGO_CAMPUSES.find(c => c.id === id)
              return campus ? (
                <button key={id} onClick={() => toggle(id)}
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
          {filtered.map(campus => (
            <button
              key={campus.id}
              onClick={() => toggle(campus.id)}
              className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center"
              style={{
                borderColor: selected.includes(campus.id) ? '#9D00FF' : 'var(--border)',
                background: selected.includes(campus.id) ? 'var(--card)' : 'var(--bg-secondary)'
              }}>
              {selected.includes(campus.id) && (
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
                {INITIALS_ONLY.includes(campus.id) ? (
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
                <div className="text-xs font-semibold leading-tight line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}>{campus.name}</div>
                <div className="text-xs mt-0.5 leading-tight line-clamp-1"
                  style={{ color: 'var(--text-secondary)' }}>{campus.university}</div>
              </div>
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
          {saving ? 'Saving...' : `Save ${selected.length} campus${selected.length !== 1 ? 'es' : ''} →`}
        </button>
      </div>
    </main>
  )
}
