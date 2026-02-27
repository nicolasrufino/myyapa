'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('reviews')
        .select('*, places(name, address, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setReviews(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const StarRow = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= rating ? '#9D00FF' : 'none'} stroke="#9D00FF" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )

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

      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#9D00FF', borderTopColor: 'transparent' }} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">✍️</span>
            <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No reviews yet</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Tap a place on the map and share your experience
            </p>
            <Link href="/map" className="mt-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: '#9D00FF' }}>
              Explore the map
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map(review => (
              <div key={review.id} className="rounded-2xl border p-4"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                    style={{ background: 'var(--bg-secondary)' }}>
                    {review.places?.image_url
                      ? <img src={review.places.image_url} alt={review.places.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">📍</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {review.places?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {review.places?.address}
                    </p>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {review.body && (
                  <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    "{review.body}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
