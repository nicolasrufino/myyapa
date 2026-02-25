'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import CampusSearch from '@/components/CampusSearch'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 420)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm)' }}>

      {/* STICKY NAV — appears after scrolling past hero */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <span style={{ fontFamily: 'var(--font-viga)' }} className="text-2xl text-gray-900">
            my<span style={{ color: '#9d00ff' }}>Yapa</span>
          </span>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/map"
                className="text-sm font-semibold text-gray-900 hover:opacity-70 transition-all">
                Map
              </Link>
              <Link href="/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: '#9D00FF' }}>
                {user.email?.[0].toUpperCase()}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login"
                className="text-sm font-semibold text-gray-900 hover:opacity-70 transition-all">
                Log in
              </Link>
              <Link href="/auth/login"
                className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all hover:opacity-90"
                style={{ background: '#9D00FF' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* HERO — full width image with overlay content */}
      <section className="relative w-full h-[630px] overflow-visible">

        {/* Background image */}
        <Image
          src="/hero-food.png"
          alt="Student food spread"
          fill
          className="object-cover object-top"
          priority
        />

        {/* Dark overlay for readability */}
        {/* <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)' }}
        /> */}

        {/* Top nav ON the image */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end px-8 py-5">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/map"
                className="text-sm font-semibold text-white hover:opacity-70 transition-all">
                Map
              </Link>
              <Link href="/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: '#9D00FF' }}>
                {user.email?.[0].toUpperCase()}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login"
                className="text-sm font-semibold text-white px-5 py-2 rounded-full border border-white/60 hover:border-white transition-all backdrop-blur-sm">
                Log in
              </Link>
              <Link href="/auth/login"
                className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all hover:opacity-90"
                style={{ background: '#9D00FF' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Centered content ON the image */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">

          <p style={{ fontFamily: 'var(--font-viga)' }} className="text-3xl md:text-4xl drop-shadow-lg mb-6">
            <span style={{ color: '#000000' }}>my</span><span style={{ color: '#ffffff' }}>Yapa</span>
          </p>

          <h1 style={{ fontFamily: 'var(--font-viga)' }}
            className="text-4xl md:text-5xl text-white leading-tight drop-shadow-lg">
            Student deals near you
          </h1>

          <p className="text-white/100 text-lg max-w-md mt-2">
            Find your Yapa
          </p>

          {/* Campus search bar */}
          <div className="mt-10 w-full max-w-lg">
            <CampusSearch />
          </div>

          {/* Sign in CTA */}
          <Link href="/auth/login"
            className="flex items-center gap-2 text-xs font-semibold text-gray-900 bg-white rounded-full px-6 py-2.5 hover:shadow-md transition-all mt-6">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign in for a better experience
          </Link>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 — Map */}
          <div className="flex flex-col items-center gap-4 text-center">
            <span style={{ fontSize: '56px', lineHeight: 1 }}>📍</span>
            <div className="max-w-[220px] flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-viga)' }} className="text-xl text-gray-900">
                Find deals near campus
              </h3>
              <p style={{ fontFamily: 'var(--font-dm)' }} className="text-gray-900 text-sm leading-relaxed">
                See every student discount spot near your university on a live map.
              </p>
              <Link href="/map" className="text-sm font-semibold" style={{ color: '#9d00ff' }}>
                Enter your campus →
              </Link>
            </div>
          </div>

          {/* Column 2 — Rewards */}
          <div className="flex flex-col items-center gap-4 text-center">
            <span style={{ fontSize: '56px', lineHeight: 1 }}>🎁</span>
            <div className="max-w-[220px] flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-viga)' }} className="text-xl text-gray-900">
                Earn points &amp; rewards
              </h3>
              <p style={{ fontFamily: 'var(--font-dm)' }} className="text-gray-900 text-sm leading-relaxed">
                Leave reviews after every visit and earn rewards. More visits, more bonuses.
              </p>
              <Link href="/rewards" className="text-sm font-semibold" style={{ color: '#9d00ff' }}>
                See how rewards work →
              </Link>
            </div>
          </div>

          {/* Column 3 — App */}
          <div className="flex flex-col items-center gap-4 text-center">
            <span style={{ fontSize: '56px', lineHeight: 1 }}>📱</span>
            <div className="max-w-[220px] flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-viga)' }} className="text-xl text-gray-900">
                Get the app
              </h3>
              <p style={{ fontFamily: 'var(--font-dm)' }} className="text-gray-900 text-sm leading-relaxed">
                The full Yapa experience on your phone. Find deals, order ahead, and earn rewards on the go.
              </p>
              <Link href="/rewards?feature=app" className="text-sm font-semibold" style={{ color: '#9d00ff' }}>
                Download the app →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-16" style={{ background: '#9d00ff' }}>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { num: '10+', label: 'Verified spots in Chicago' },
            { num: '10–20%', label: 'Average student discount' },
            { num: 'Near by', label: 'Every spot is close to your campus' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-viga)' }}
                className="text-5xl mb-2">{num}</div>
              <div className="text-white text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-900">
        © 2026 myYapa · Chicago, IL 
        {/* · */}
        {/* <Link href="/about" className="ml-2 hover:text-gray-600">About</Link> ·
        <Link href="/contact" className="ml-2 hover:text-gray-600">Contact</Link> */}
      </footer>

    </main>
  )
}