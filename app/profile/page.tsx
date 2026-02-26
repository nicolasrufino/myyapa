'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'
import { useTheme } from '@/lib/context/ThemeContext'

interface UserProfile {
  id: string
  display_name: string
  username: string | null
  edu_email: string | null
  edu_verified: boolean
  review_count: number
  rewards_balance: number
  preferred_campuses: string[]
  preferred_categories: string[]
  username_changed_at: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const canChange = (lastChangedAt: string | null) => {
    if (!lastChangedAt) return true
    const daysSince = (Date.now() - new Date(lastChangedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince >= 14
  }

  const daysUntilChange = (lastChangedAt: string | null) => {
    if (!lastChangedAt) return 0
    const daysSince = (Date.now() - new Date(lastChangedAt).getTime()) / (1000 * 60 * 60 * 24)
    return Math.ceil(14 - daysSince)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setAuthUser(user)

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setUsername(data.username || '')
        setDisplayName(data.display_name || user.user_metadata?.full_name || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async () => {
    if (!authUser) return
    setSaving(true)
    setError('')

    if (!canChange(profile?.username_changed_at ?? null)) {
      setError(`You can change your username again in ${daysUntilChange(profile?.username_changed_at ?? null)} days`)
      setSaving(false)
      return
    }

    const now = new Date().toISOString()
    const { error } = await supabase
      .from('users')
      .update({ username, display_name: displayName, username_changed_at: now })
      .eq('id', authUser.id)

    if (error) {
      setError(error.message)
    } else {
      setProfile(prev => prev ? { ...prev, username, display_name: displayName, username_changed_at: now } : prev)
      setEditing(false)
    }
    setSaving(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen" style={{ fontFamily: 'var(--font-dm)', background: 'var(--bg-secondary)' }}>

      {/* Nav */}
      <div className="border-b px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/map"
          className="flex items-center gap-2 text-sm hover:opacity-70 transition-all"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to map
        </Link>
        <Link href="/map"
          style={{ fontFamily: 'var(--font-viga)' }}
          className="text-xl">
          <span style={{ color: 'var(--text-primary)' }}>my</span>
          <span style={{ color: '#9D00FF' }}>Yapa</span>
        </Link>
        <button
          onClick={signOut}
          className="text-xs font-semibold hover:opacity-70 transition-all"
          style={{ color: 'var(--text-secondary)' }}>
          Sign out
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Avatar + name */}
        <div className="rounded-2xl p-6 flex items-center gap-4 border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ background: '#9D00FF' }}>
            {(profile?.username || authUser?.email)?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-full"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>@</span>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="username"
                    className="flex-1 text-sm outline-none bg-transparent"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                {error && <p className="text-red-500 text-xs px-2">{error}</p>}
                {!canChange(profile?.username_changed_at ?? null) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Can change username in {daysUntilChange(profile?.username_changed_at ?? null)} days
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="text-xs font-bold text-white px-4 py-2 rounded-full disabled:opacity-50"
                    style={{ background: '#9D00FF' }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-xs hover:opacity-70 px-4 py-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
                  className="text-xl">
                  @{profile?.username || 'username'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{authUser?.email}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs mt-2 font-semibold underline"
                  style={{ color: '#9D00FF' }}>
                  Edit profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Student verification */}
        <div className="rounded-2xl p-6 border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
            className="text-lg mb-1">
            Student Status
          </h3>
          {profile?.edu_verified ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Verified student</span>
              {profile.edu_email && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>· {profile.edu_email}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Not verified yet</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Verify your .edu email to unlock rewards, your Yapa pass, and student pricing.
              </p>
              <Link href="/onboarding"
                className="inline-flex text-xs font-bold text-white px-4 py-2 rounded-full w-fit"
                style={{ background: '#9D00FF' }}>
                Verify now →
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 border text-center"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-3xl mb-1">
              {profile?.review_count || 0}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reviews</div>
          </div>
          <div className="rounded-2xl p-6 border text-center"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-viga)', color: '#9D00FF' }}
              className="text-3xl mb-1">
              ${profile?.rewards_balance || 0}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rewards balance</div>
          </div>
        </div>

        {/* Campuses */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-lg">My Campuses</h3>
            <Link href="/profile/campuses"
              className="text-xs font-semibold underline"
              style={{ color: '#9D00FF' }}>
              Edit
            </Link>
          </div>
          <div className="px-6 py-4">
            {(profile?.preferred_campuses ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(profile?.preferred_campuses ?? []).map(id => {
                  const campus = CHICAGO_CAMPUSES.find(c => c.id === id)
                  return campus ? (
                    <span key={id}
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      {campus.name}
                    </span>
                  ) : null
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No campuses added yet</p>
                <Link href="/profile/campuses"
                  className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ background: '#9D00FF' }}>
                  Add →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-lg">My Interests</h3>
            <Link href="/profile/interests"
              className="text-xs font-semibold underline"
              style={{ color: '#9D00FF' }}>
              Edit
            </Link>
          </div>
          <div className="px-6 py-4">
            {(profile?.preferred_categories ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(profile?.preferred_categories ?? []).map(cat => (
                  <span key={cat}
                    className="px-3 py-1 rounded-full text-xs font-semibold border capitalize"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    {cat}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No interests added yet</p>
                <Link href="/profile/interests"
                  className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ background: '#9D00FF' }}>
                  Add →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
                className="text-lg">
                Appearance
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full p-1"
              style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setTheme('light')}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: theme === 'light' ? '#9D00FF' : 'transparent',
                  color: theme === 'light' ? 'white' : 'var(--text-secondary)'
                }}>
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: theme === 'dark' ? '#9D00FF' : 'transparent',
                  color: theme === 'dark' ? 'white' : 'var(--text-secondary)'
                }}>
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {[
            { label: ' Saved places', href: '/rewards?feature=saved' },
            { label: ' My reviews', href: '/rewards?feature=reviews' },
            { label: ' Order history', href: '/rewards?feature=orders' },
            { label: ' Rewards & points', href: '/rewards?feature=rewards' },
            { label: ' Add a place', href: '/places/add' },
            { label: ' Support', href: '/rewards?feature=support' },
            { label: ' Account Settings', href: '/account' },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:opacity-80 transition-all text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              {label}
              <span style={{ color: 'var(--text-secondary)' }}>›</span>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full border rounded-full py-3 text-sm font-semibold hover:opacity-70 transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Sign out
        </button>

      </div>
    </main>
  )
}
