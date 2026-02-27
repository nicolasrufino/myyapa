'use client'
import Link from 'next/link'

export default function RewardsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Profile
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#9D00FF" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <p className="font-bold text-xl text-center"
          style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
          Rewards are coming
        </p>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Earn points every time you use a student discount through Yapa. Redeem them for exclusive perks and free stuff.
        </p>
        <Link href="/rewards"
          className="mt-2 px-6 py-3 rounded-full text-sm font-bold text-white"
          style={{ background: '#9D00FF' }}>
          Join the waitlist →
        </Link>
      </div>
    </div>
  )
}
