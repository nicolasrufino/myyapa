'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/context/ThemeContext'

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? '#9D00FF' : 'none'}
    stroke="#9D00FF" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

export default function PlaceDrawer({ place, onClose, navHeight = 0 }: { place: any, onClose: () => void, navHeight?: number }) {
  if (!place) return null

  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(true)
  const [tab, setTab] = useState<'info' | 'reviews'>('info')
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [savingPlace, setSavingPlace] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportNote, setReportNote] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const supabase = createClient()

  // Detect mobile vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    load()
  }, [])

  useEffect(() => {
    const checkSaved = async () => {
      if (!user) return
      const { data } = await supabase
        .from('saved_places')
        .select('*')
        .eq('user_id', user.id)
        .eq('place_id', place.id)
        .maybeSingle()
      setSaved(!!data)
    }
    checkSaved()
  }, [user, place.id])

  const toggleSave = async () => {
    if (!user) return
    setSavingPlace(true)
    if (saved) {
      await supabase.from('saved_places')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', place.id)
      setSaved(false)
    } else {
      await supabase.from('saved_places')
        .insert({ user_id: user.id, place_id: place.id })
      setSaved(true)
    }
    setSavingPlace(false)
  }

  const submitReport = async () => {
    await supabase.from('reports').insert({
      place_id: place.id,
      user_id: user?.id,
      type: reportType,
      note: reportNote,
    })
    setReportSent(true)
  }

  useEffect(() => {
    if (tab === 'reviews') fetchReviews()
  }, [tab])

  const fetchReviews = async () => {
    setLoadingReviews(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, users(username)')
      .eq('place_id', place.id)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoadingReviews(false)
  }

  const submitReview = async () => {
    if (!user) return
    setSubmitting(true)
    await supabase.from('reviews').insert({
      place_id: place.id,
      user_id: user.id,
      rating,
      body,
    })
    setBody('')
    setRating(5)
    setShowForm(false)
    fetchReviews()
    setSubmitting(false)
  }

  const getDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_name=${encodeURIComponent(place.name)}`,
      '_blank'
    )
  }

  const drawerStyle = isMobile
    ? {
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: '24px 24px 0 0',
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: '80vh',
      }
    : {
        right: 0,
        top: navHeight,
        bottom: 0,
        width: '380px',
        borderTopLeftRadius: '24px',
        borderBottomLeftRadius: '0px',
        background: 'var(--card)',
        borderLeft: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
      }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer — bottom sheet on mobile, right panel on desktop */}
      <div className="fixed z-50 flex flex-col" style={drawerStyle}>

        {/* Drag handle — mobile only */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {place.logo_url && (
                <img src={place.logo_url} alt={place.name}
                  className="w-10 h-10 rounded-xl object-contain shrink-0"
                  style={{ border: '1px solid var(--border)' }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <div>
                <h2 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
                  className="text-xl leading-tight">{place.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {place.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Save button */}
              <button onClick={toggleSave} disabled={savingPlace}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{
                  background: saved ? '#f5f0ff' : 'var(--bg-secondary)',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill={saved ? '#9D00FF' : 'none'}
                  stroke={saved ? '#9D00FF' : 'var(--text-secondary)'}
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>

              {/* Close button */}
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Rating + discount */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(place.avg_rating)} />)}
              <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-primary)' }}>
                {place.avg_rating}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ background: '#9D00FF' }}>
              {place.discount_description}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 px-5"
          style={{ borderColor: 'var(--border)' }}>
          {(['info', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-2 px-4 text-sm font-semibold capitalize transition-all border-b-2 -mb-px"
              style={{
                borderColor: tab === t ? '#9D00FF' : 'transparent',
                color: tab === t ? '#9D00FF' : 'var(--text-secondary)'
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {/* INFO TAB */}
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              {/* Photo */}
              {place.image_url && (
                <img src={place.image_url} alt={place.name}
                  className="w-full h-40 object-cover rounded-2xl"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              )}

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {place.category?.map((cat: string) => (
                  <span key={cat}
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* Discount detail */}
              <div className="rounded-2xl px-4 py-3"
                style={{
                  background: theme === 'dark' ? '#1e0a2e' : '#f5f0ff',
                  border: `1px solid ${theme === 'dark' ? '#4a1a7a' : '#e0d0ff'}`,
                }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-0.5"
                  style={{ color: '#9D00FF' }}>Student Discount</p>
                <p className="text-sm font-semibold"
                  style={{ color: theme === 'dark' ? '#c084fc' : '#6b00cc' }}>
                  {place.discount_description}
                </p>
              </div>

              {/* Rating note */}
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                ★ Rating based on Google Reviews
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 mt-2">
                <button onClick={getDirections}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  Directions
                </button>
                <button onClick={() => setTab('reviews')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white"
                  style={{ background: '#9D00FF' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Reviews
                </button>
              </div>

              {/* Report button */}
              <button onClick={() => setShowReport(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border transition-all hover:opacity-70"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span className="text-xs font-semibold">Report an issue</span>
              </button>
            </div>
          )}

          {/* REVIEWS TAB */}
          {tab === 'reviews' && (
            <div className="flex flex-col gap-4">

              {/* Add review button */}
              {!showForm && (
                <button
                  onClick={() => user ? setShowForm(true) : null}
                  className="w-full py-3 rounded-full text-sm font-bold text-white"
                  style={{ background: '#9D00FF' }}>
                  {user ? '+ Write a review' : 'Sign in to review'}
                </button>
              )}

              {/* Review form */}
              {showForm && (
                <div className="rounded-2xl border p-4 flex flex-col gap-3"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="flex gap-1">
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
                  <textarea
                    placeholder="Share your experience... (optional)"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-2 rounded-full text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                    <button onClick={submitReview} disabled={submitting}
                      className="flex-1 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: '#9D00FF' }}>
                      {submitting ? 'Posting...' : 'Post →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              {loadingReviews ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#9D00FF', borderTopColor: 'transparent' }} />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No reviews yet — be the first!
                  </p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id}
                    className="rounded-2xl border p-4"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}>
                        @{review.users?.username || 'user'}
                      </span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= review.rating} />)}
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
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full rounded-t-3xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--card)' }}>
            {reportSent ? (
              <div className="text-center py-4">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Thanks for the report!
                </p>
                <button onClick={() => { setShowReport(false); setReportSent(false); setReportType(''); setReportNote('') }}
                  className="mt-3 text-sm underline" style={{ color: '#9D00FF' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
                  Report an issue
                </h3>
                <div className="flex flex-col gap-2">
                  {['Wrong location', 'Discount is incorrect', 'Place is closed', 'Wrong name', 'Other'].map(type => (
                    <button key={type} onClick={() => setReportType(type)}
                      className="px-4 py-3 rounded-2xl border text-sm text-left font-semibold transition-all"
                      style={{
                        borderColor: reportType === type ? '#9D00FF' : 'var(--border)',
                        background: reportType === type ? (theme === 'dark' ? '#2a1a4a' : '#f5f0ff') : 'var(--card)',
                        color: reportType === type ? '#9D00FF' : 'var(--text-primary)'
                      }}>
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Additional details (optional)"
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none border resize-none"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowReport(false)}
                    className="flex-1 py-3 rounded-full text-sm border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    Cancel
                  </button>
                  <button onClick={submitReport} disabled={!reportType}
                    className="flex-1 py-3 rounded-full text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: '#9D00FF' }}>
                    Submit report →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
