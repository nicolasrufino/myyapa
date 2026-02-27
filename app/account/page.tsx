'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<string>('')
  const [hasPassword, setHasPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

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
      setUser(user)
      const provider = user.app_metadata?.provider || 'email'
      setProvider(provider)
      const identities = user.identities || []
      const emailIdentity = identities.find((i: any) => i.provider === 'email')
      setHasPassword(!!emailIdentity)
      console.log('identities:', identities)
      console.log('hasPassword:', !!emailIdentity)
      const { data: profileData } = await supabase
        .from('users')
        .select('email_changed_at')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
    load()
  }, [])

  const handleChangePassword = async () => {
    setLoadingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setLoadingPassword(false)
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setLoadingPassword(false)
      return
    }

    // If changing existing password, verify current one first
    if (hasPassword && currentPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) {
        setPasswordError('Current password is incorrect')
        setLoadingPassword(false)
        return
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(hasPassword ? 'Password updated!' : 'Password added! You can now sign in with your email too.')
      setHasPassword(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoadingPassword(false)
  }

  const handleChangeEmail = async () => {
    setLoadingEmail(true)
    setEmailError('')
    setEmailSuccess('')

    if (!newEmail.includes('@')) {
      setEmailError('Enter a valid email')
      setLoadingEmail(false)
      return
    }

    if (!canChange(profile?.email_changed_at ?? null)) {
      setEmailError(`You can change your email again in ${daysUntilChange(profile?.email_changed_at ?? null)} days`)
      setLoadingEmail(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) setEmailError(error.message)
    else {
      const now = new Date().toISOString()
      await supabase.from('users')
        .update({ personal_email: newEmail, email_changed_at: now })
        .eq('id', user.id)
      setProfile((prev: any) => prev ? { ...prev, email_changed_at: now } : prev)
      setEmailSuccess('Confirmation sent to your new email!')
    }
    setLoadingEmail(false)
  }

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'delete my account') {
      setDeleteError('Type "delete my account" to confirm')
      return
    }
    setLoadingDelete(true)
    setDeleteError('')

    const { error } = await supabase.rpc('delete_user_account')
    if (error) {
      setDeleteError(error.message)
      setLoadingDelete(false)
    } else {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen pb-20"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Profile
        </Link>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-lg mx-auto">

        {/* Provider info */}
        <div className="rounded-2xl border px-6 py-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-secondary)' }}>Signed in with</p>
          <p className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}>
            {provider === 'google' ? 'Google' : 'Email & Password'}
          </p>
          <p className="text-xs mt-0.5"
            style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>

        {/* Password section — change or add */}
        <div className="rounded-2xl border px-6 py-5 flex flex-col gap-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

          <div>
            <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-lg">
              {hasPassword ? 'Change Password' : 'Add a Password'}
            </h2>
            {!hasPassword && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Add a password so you can also sign in with your email directly — not just Google.
              </p>
            )}
          </div>

          {!hasPassword && provider !== 'email' && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'var(--bg-secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#9D00FF" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                You're currently signed in with {provider === 'google' ? 'Google' : 'Apple'} only.
                Adding a password lets you log in with your email too.
              </p>
            </div>
          )}

          {hasPassword && (
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }}
              className="w-full rounded-full px-5 py-3 text-sm outline-none border transition-all"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          )}

          <input
            type="password"
            placeholder={hasPassword ? 'New password' : 'Create a password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }}
            className="w-full rounded-full px-5 py-3 text-sm outline-none border transition-all"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }}
            className="w-full rounded-full px-5 py-3 text-sm outline-none border transition-all"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />

          {passwordError && <p className="text-red-500 text-xs px-2">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-500 text-xs px-2">{passwordSuccess}</p>}

          <button
            onClick={handleChangePassword}
            disabled={loadingPassword}
            className="w-full text-white rounded-full py-3 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: '#9D00FF' }}>
            {loadingPassword
              ? 'Saving...'
              : hasPassword
                ? 'Update password →'
                : 'Add password →'
            }
          </button>
        </div>

        {/* Change email */}
        <div className="rounded-2xl border px-6 py-5 flex flex-col gap-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
            className="text-lg">Change Email</h2>
          <p className="text-xs"
            style={{ color: 'var(--text-secondary)' }}>
            We'll send a confirmation to your current email to verify before updating.
          </p>

          {!canChange(profile?.email_changed_at ?? null) && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Can change email in {daysUntilChange(profile?.email_changed_at ?? null)} days
            </div>
          )}

          <input
            type="email"
            placeholder="New email address"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleChangeEmail() }}
            className="w-full rounded-full px-5 py-3 text-sm outline-none border transition-all"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />

          {emailError && <p className="text-red-500 text-xs px-2">{emailError}</p>}
          {emailSuccess && <p className="text-green-500 text-xs px-2">{emailSuccess}</p>}

          <button
            onClick={handleChangeEmail}
            disabled={loadingEmail}
            className="w-full text-white rounded-full py-3 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: '#9D00FF' }}>
            {loadingEmail ? 'Sending...' : 'Update email →'}
          </button>
        </div>

        {/* Sign out all devices */}
        <div className="rounded-2xl border px-6 py-5 flex flex-col gap-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-lg">Sign Out Everywhere</h2>
            <p className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)' }}>
              Signs you out of all devices and sessions.
            </p>
          </div>
          <button
            onClick={handleSignOutAll}
            className="w-full rounded-full py-3 text-sm font-bold border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            Sign out all devices
          </button>
        </div>

        {/* Delete account */}
        <div className="rounded-2xl border border-red-200 px-6 py-5 flex flex-col gap-4"
          style={{ background: 'var(--card)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-viga)' }}
              className="text-lg text-red-500">Delete Account</h2>
            <p className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)' }}>
              This is permanent. All your data, reviews, and rewards will be deleted and cannot be recovered.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-full py-3 text-sm font-bold border border-red-300 text-red-500 hover:bg-red-50 transition-all">
              Delete my account
            </button>
          ) : (
            <>
              <p className="text-xs font-semibold text-red-500">
                Type "delete my account" to confirm
              </p>
              <input
                type="text"
                placeholder='delete my account'
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDeleteAccount() }}
                className="w-full rounded-full px-5 py-3 text-sm outline-none border border-red-300 transition-all"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              {deleteError && <p className="text-red-500 text-xs px-2">{deleteError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm('') }}
                  className="flex-1 rounded-full py-3 text-sm font-bold border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="flex-1 rounded-full py-3 text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
                  {loadingDelete ? 'Deleting...' : 'Delete forever'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </main>
  )
}
