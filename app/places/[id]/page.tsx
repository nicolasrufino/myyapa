'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTheme } from '@/lib/context/ThemeContext'

interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: string[]
  discount_description: string
  avg_rating: number
  website?: string
  status: string
}

interface Review {
  id: string
  rating: number
  body: string
  created_at: string
  users: { username: string }
}

export default function PlaceDetailPage() {
  const { theme } = useTheme()
  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: place } = await supabase
        .from('places')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!place) { router.push('/map'); return }
      setPlace(place)

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, users(username)')
        .eq('place_id', params.id)
        .order('created_at', { ascending: false })

      setReviews(reviews || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  const submitReview = async () => {
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)

    await supabase.from('reviews').insert({
      place_id: params.id,
      user_id: user.id,
      rating,
      body,
    })

    // Update avg_rating on place
    const newAvg = reviews.length > 0
      ? ((place!.avg_rating * reviews.length) + rating) / (reviews.length + 1)
      : rating

    await supabase.from('places')
      .update({ avg_rating: Math.round(newAvg * 10) / 10 })
      .eq('id', params.id)

    // Reload reviews
    const { data: updated } = await supabase
      .from('reviews')
      .select('*, users(username)')
      .eq('place_id', params.id)
      .order('created_at', { ascending: false })

    setReviews(updated || [])
    setComment('')
    setRating(5)
    setShowReviewForm(false)
    setSubmitting(false)
  }

  const getDirections = () => {
    if (!place) return
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_name=${encodeURIComponent(place.name)}`,
      '_blank'
    )
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#9D00FF', borderTopColor: 'transparent' }} />
    </main>
  )

  if (!place) return null

  return (
    <main className="min-h-screen pb-24"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <Link href="/map" style={{ fontFamily: 'var(--font-viga)' }} className="text-lg">
          <span style={{ color: 'var(--text-primary)' }}>my</span>
          <span style={{ color: '#9D00FF' }}>Yapa</span>
        </Link>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-lg mx-auto">

        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-3xl leading-tight">{place.name}</h1>
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#9D00FF">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {place.avg_rating}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                ({reviews.length})
              </span>
            </div>
          </div>

          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {place.address}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-3">
            {place.category?.map(cat => (
              <span key={cat}
                className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Discount banner */}
        <div className="rounded-2xl px-5 py-4"
          style={{
            background: theme === 'dark' ? '#1e0a2e' : '#f5f0ff',
            border: `1px solid ${theme === 'dark' ? '#4a1a7a' : '#e0d0ff'}`,
          }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: '#9D00FF' }}>Student Discount</p>
          <p className="text-sm font-semibold"
            style={{ color: theme === 'dark' ? '#c084fc' : '#6b00cc' }}>
            {place.discount_description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={getDirections}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#9D00FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions
          </button>
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold border transition-all hover:opacity-70"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Website
            </a>
          )}
        </div>

        {/* Reviews section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
              className="text-xl">Reviews</h2>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-xs font-bold text-white px-4 py-2 rounded-full"
                style={{ background: '#9D00FF' }}>
                + Add review
              </button>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="rounded-2xl border p-5 mb-4 flex flex-col gap-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

              {/* Star rating */}
              <div>
                <p className="text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}>Rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)}>
                      <svg width="28" height="28" viewBox="0 0 24 24"
                        fill={star <= rating ? '#9D00FF' : 'none'}
                        stroke="#9D00FF" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share your experience... (optional)"
                value={body}
                onChange={e => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none border resize-none"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 rounded-full py-3 text-sm font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="flex-1 rounded-full py-3 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: '#9D00FF' }}>
                  {submitting ? 'Posting...' : 'Post review →'}
                </button>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border"
              style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No reviews yet — be the first!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(review => (
                <div key={review.id}
                  className="rounded-2xl border p-4"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}>
                      @{review.users?.username || 'user'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} width="12" height="12" viewBox="0 0 24 24"
                          fill={star <= review.rating ? '#9D00FF' : 'none'}
                          stroke="#9D00FF" strokeWidth="1.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.body && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {review.body}
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
