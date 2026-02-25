'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'

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

    const { error } = await supabase
      .from('users')
      .update({ username, display_name: displayName })
      .eq('id', authUser.id)

    if (error) {
      setError(error.message)
    } else {
      setProfile(prev => prev ? { ...prev, username, display_name: displayName } : prev)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/map"
          className="flex items-center gap-2 text-sm text-gray-900 hover:opacity-70 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to map
        </Link>
        <span style={{ fontFamily: 'var(--font-viga)' }} className="text-xl text-gray-900">
          my<span style={{ color: '#9D00FF' }}>Yapa</span>
        </span>
        <button
          onClick={signOut}
          className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all">
          Sign out
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Avatar + name */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4 border border-gray-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ background: '#9D00FF' }}>
            {(profile?.username || authUser?.email)?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full">
                  <span className="text-sm text-gray-900">@</span>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="username"
                    className="flex-1 text-sm text-gray-900 outline-none"
                  />
                </div>
                {error && <p className="text-red-500 text-xs px-2">{error}</p>}
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
                    className="text-xs text-gray-900 hover:opacity-70 px-4 py-2">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-viga)' }}
                  className="text-xl text-gray-900">
                  @{profile?.username || 'username'}
                </h2>
                <p className="text-sm text-gray-900">{authUser?.email}</p>
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
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 style={{ fontFamily: 'var(--font-viga)' }}
            className="text-lg text-gray-900 mb-1">
            Student Status
          </h3>
          {profile?.edu_verified ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-900">Verified student</span>
              {profile.edu_email && (
                <span className="text-xs text-gray-700">· {profile.edu_email}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-sm text-gray-700">Not verified yet</span>
              </div>
              <p className="text-xs text-gray-700">
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
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div style={{ fontFamily: 'var(--font-viga)' }}
              className="text-3xl text-gray-900 mb-1">
              {profile?.review_count || 0}
            </div>
            <div className="text-xs text-gray-700">Reviews</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div style={{ fontFamily: 'var(--font-viga)', color: '#9D00FF' }}
              className="text-3xl mb-1">
              ${profile?.rewards_balance || 0}
            </div>
            <div className="text-xs text-gray-700">Rewards balance</div>
          </div>
        </div>

        {/* Campuses & Interests */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-lg text-gray-900">My Campuses</h3>
            <Link href="/onboarding"
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
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-900">
                      🎓 {campus.name}
                    </span>
                  ) : null
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">No campuses added yet</p>
                <Link href="/onboarding"
                  className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ background: '#9D00FF' }}>
                  Add →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-lg text-gray-900">My Interests</h3>
            <Link href="/onboarding"
              className="text-xs font-semibold underline"
              style={{ color: '#9D00FF' }}>
              Edit
            </Link>
          </div>
          <div className="px-6 py-4">
            {(profile?.preferred_categories ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(profile?.preferred_categories ?? []).map(cat => {
                  const emoji: Record<string, string> = {
                    food: '🍕', coffee: '☕', drinks: '🥤',
                    museums: '🎨', sports: '🏟️', theater: '🎭', shopping: '🛍️'
                  }
                  return (
                    <span key={cat}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-900 capitalize">
                      {emoji[cat]} {cat}
                    </span>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">No interests added yet</p>
                <Link href="/onboarding"
                  className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ background: '#9D00FF' }}>
                  Add →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[
            { label: ' Saved places', href: '/profile/saved' },
            { label: ' My reviews', href: '/profile/reviews' },
            { label: ' Order history', href: '/profile/orders' },
            { label: ' Rewards & points', href: '/rewards' },
            { label: ' Add a place', href: '/places/add' },
            { label: ' Support', href: '/support' },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all text-sm text-gray-900">
              {label}
              <span className="text-gray-600">›</span>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full border border-gray-200 rounded-full py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all">
          Sign out
        </button>

      </div>
    </main>
  )
}