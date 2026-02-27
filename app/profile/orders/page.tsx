'use client'
import Link from 'next/link'

export default function OrderHistoryPage() {
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
      <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
        <span className="text-6xl">🧾</span>
        <p className="font-bold text-xl text-center"
          style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
          No orders yet
        </p>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Your order history will appear here once you start ordering through Yapa.
        </p>
        <div className="mt-2 px-5 py-2.5 rounded-full text-xs font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Coming soon
        </div>
      </div>
    </div>
  )
}
