'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BANNED_WORDS = ['admin', 'moderator', 'yapa', 'support', 'official', 'staff', 'mod', 'fuck', 'shit', 'ass', 'bitch', 'nigga', 'nigger', 'faggot', 'retard', 'kill', 'die', 'hate', 'racist']

const validateUsername = (u: string) => {
  if (u.length < 3) return 'Username must be at least 3 characters'
  if (u.length > 20) return 'Username must be under 20 characters'
  if (!/^[a-z0-9_.]+$/.test(u)) return 'Only lowercase letters, numbers, . and _ allowed'
  if (/^[._]/.test(u) || /[._]$/.test(u)) return 'Cannot start or end with . or _'
  if (/[_.]{2}/.test(u)) return 'Cannot have two special characters in a row'
  if (BANNED_WORDS.some(w => u.includes(w))) return 'That username is not allowed'
  return null
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [identifier, setIdentifier] = useState('') // email or username for login
  const [email, setEmail] = useState('') // only for signup
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleForgotPassword = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    let resolvedEmail = identifier

    // If not an email, look up by username
    if (!identifier.includes('@')) {
      const { data } = await supabase.rpc('get_email_by_username', {
        input_username: identifier
      })
      if (!data) {
        setError('No account found with that username')
        setLoading(false)
        return
      }
      resolvedEmail = data
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resolvedEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) setError(error.message)
    else setSuccess('Check your email for a password reset link!')
    setLoading(false)
  }

  const handleEmailAuth = async () => {
    setLoading(true)
    setError('')

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const usernameError = validateUsername(username)
      if (usernameError) {
        setError(usernameError)
        setLoading(false)
        return
      }

      // Check username not taken
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existing) {
        setError('That username is already taken')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            username,
            display_name: username,
            personal_email: email,
            edu_verified: false,
          })
        }
        router.push('/onboarding')
      }
    } else {
      // Login — resolve username to email if needed
      let resolvedEmail = identifier

      if (!identifier.includes('@')) {
        const { data } = await supabase.rpc('get_email_by_username', {
          input_username: identifier
        })
        if (!data) {
          setError('No account found with that username')
          setLoading(false)
          return
        }
        resolvedEmail = data
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password
      })
      if (error) setError(error.message)
      else router.push('/map')
    }
    setLoading(false)
  }

  // Forgot password view
  if (isForgotPassword) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ fontFamily: 'var(--font-dm)', background: '#fafafa' }}>
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
        <div className="relative z-10 flex flex-col items-center gap-4 bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full mx-4">
          <button
            onClick={() => { setIsForgotPassword(false); setError(''); setSuccess('') }}
            className="self-start flex items-center gap-2 text-sm text-gray-900 hover:opacity-70 transition-all mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <span style={{ fontFamily: 'var(--font-viga)' }}
            className="text-3xl text-gray-900 mb-2">
            my<span style={{ color: '#9D00FF' }}>Yapa</span>
          </span>

          <p className="text-sm font-semibold text-gray-900">Reset your password</p>
          <p className="text-xs text-gray-600 text-center">
            Enter your email or username and we'll send you a reset link.
          </p>

          <input
            type="text"
            placeholder="Email or username"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
          />

          {error && <p className="text-red-500 text-xs w-full px-2">{error}</p>}
          {success && <p className="text-green-600 text-xs w-full px-2">{success}</p>}

          <button
            onClick={handleForgotPassword}
            disabled={loading || !!success}
            className="w-full text-white rounded-full px-6 py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#9D00FF' }}>
            {loading ? 'Sending...' : 'Send reset link →'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm)', background: '#fafafa' }}>
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
      <div className="relative z-10 flex flex-col items-center gap-4 bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full mx-4">

        <Link href="/"
          className="self-start flex items-center gap-2 text-sm text-gray-900 hover:opacity-70 transition-all mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <span style={{ fontFamily: 'var(--font-viga)' }}
          className="text-3xl text-gray-900 mb-2">
          my<span style={{ color: '#9D00FF' }}>Yapa</span>
        </span>

        <p className="text-sm text-gray-900 font-semibold">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        {/* Sign up fields */}
        {isSignUp ? (
          <>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
            />
            <div className="w-full flex items-center gap-2 border border-gray-200 rounded-full px-5 py-4 focus-within:border-[#9D00FF] transition-all">
              <span className="text-sm text-gray-500">@</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="flex-1 text-sm text-gray-900 outline-none"
              />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-4 text-sm text-gray-900 outline-none focus:border-[#9D00FF] transition-all"
            />
            <button
              onClick={() => { setIsForgotPassword(true); setError('') }}
              className="self-end text-xs underline"
              style={{ color: '#9D00FF' }}>
              Forgot password?
            </button>
          </>
        )}

        {error && <p className="text-red-500 text-xs w-full px-2">{error}</p>}

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full text-white rounded-full px-6 py-4 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#9D00FF' }}>
          {loading ? 'Loading...' : isSignUp ? 'Create account →' : 'Log in →'}
        </button>

        <p className="text-xs text-gray-900">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="font-bold underline"
            style={{ color: '#9D00FF' }}>
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>

        <div className="flex items-center gap-3 w-full my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-900 font-semibold">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full px-6 py-4 text-sm font-semibold text-gray-900 hover:border-gray-400 hover:shadow-sm transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          className="w-full flex items-center justify-center gap-3 bg-black rounded-full px-6 py-4 text-sm font-semibold text-white hover:bg-gray-900 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>

      </div>
    </main>
  )
}
