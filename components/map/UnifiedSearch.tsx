'use client'

import { useState, useRef, useEffect, JSX } from 'react'
import { useRouter } from 'next/navigation'
import { CHICAGO_CAMPUSES, Campus } from '@/lib/campuses'
import { SCHOOL_DOMAINS, SCHOOL_LOGO_OVERRIDES } from '@/lib/schoolLogos'

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  food: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M3 12h18"/></svg>,
  coffee: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 2v4m4-4v4m4-4v4M4 10h16l-2 10H6L4 10zm12 0h2a2 2 0 010 4h-2"/></svg>,
  drinks: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>,
  museums: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h1v11H4V10zm5 0h1v11H9V10zm5 0h1v11h-1V10zm5 0h1v11h-1V10z"/></svg>,
  sports: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0 3 4.5 3 9s-3 9-3 9M12 3c0 0-3 4.5-3 9s3 9 3 9M3 12h18"/></svg>,
  theater: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/></svg>,
  shopping: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>,
}

interface Place {
  id: string
  name: string
  lat: number
  lng: number
  discount_description: string
  category: string[]
  avg_rating: number
  address: string
}

interface UnifiedSearchProps {
  places: Place[]
  onPlaceSelect: (place: Place) => void
  userLocation: { lat: number, lng: number } | null
  campusCenter: { lat: number, lng: number } | null
  campusName: string | null
}


function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959 // miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function UnifiedSearch({
  places,
  onPlaceSelect,
  userLocation,
  campusCenter,
  campusName,
}: UnifiedSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const refPoint = userLocation || campusCenter || { lat: 41.8781, lng: -87.6298 }

  const campusResults = query.length > 0
    ? CHICAGO_CAMPUSES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.university.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : []

  const placeResults = query.length > 0
    ? places
        .filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
          p.discount_description.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) =>
          getDistance(refPoint.lat, refPoint.lng, a.lat, a.lng) -
          getDistance(refPoint.lat, refPoint.lng, b.lat, b.lng)
        )
        .slice(0, 5)
    : []

  const allResults = [
    ...campusResults.map(c => ({ type: 'campus' as const, data: c })),
    ...placeResults.map(p => ({ type: 'place' as const, data: p })),
  ]

  useEffect(() => {
    setHighlightedIndex(0)
    setOpen(query.length > 0 && allResults.length > 0)
  }, [query, allResults.length])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCampusSelect = (campus: Campus) => {
    setQuery(campus.name)
    setOpen(false)
    router.push(`/map?campus=${campus.id}&lat=${campus.lat}&lng=${campus.lng}&name=${encodeURIComponent(campus.name)}`)
  }

  const handlePlaceSelect = (place: Place) => {
    setQuery(place.name)
    setOpen(false)
    onPlaceSelect(place)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allResults.length > 0) {
      const item = allResults[highlightedIndex]
      if (item.type === 'campus') handleCampusSelect(item.data as Campus)
      else handlePlaceSelect(item.data as Place)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative flex-1">
      <div className="flex items-center gap-2 rounded-full px-4 py-2"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <svg className="w-4 h-4 shrink-0" fill="none"
          stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: 'var(--text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={campusName ? `Search near ${campusName}...` : 'Search campus, matcha, museums...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => allResults.length > 0 && setOpen(true)}
          className="flex-1 text-sm outline-none"
          style={{ background: 'transparent', color: 'var(--text-primary)' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }}
            className="text-sm hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}>✕</button>
        )}
      </div>

      {open && (
        <div ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl border overflow-y-auto z-[100]"
          style={{ maxHeight: '320px', background: 'var(--card)', borderColor: 'var(--border)' }}>

          {campusResults.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}>Campuses</span>
              </div>
              {campusResults.map((campus, i) => (
                <button
                  key={campus.id}
                  onClick={() => handleCampusSelect(campus)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-b last:border-0"
                  style={{
                    background: highlightedIndex === i ? 'var(--bg-secondary)' : 'var(--card)',
                    borderColor: 'var(--border)',
                  }}>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                    <img
                      src={SCHOOL_LOGO_OVERRIDES[campus.id] || `https://www.google.com/s2/favicons?domain=${SCHOOL_DOMAINS[campus.id]}&sz=32`}
                      alt={campus.name}
                      className="w-5 h-5 object-contain"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{campus.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{campus.university}</div>
                  </div>
                  {highlightedIndex === i && (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>↵</span>
                  )}
                </button>
              ))}
            </>
          )}

          {placeResults.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}>
                  {campusName ? `Near ${campusName}` : userLocation ? 'Near you' : 'Places'}
                </span>
              </div>
              {placeResults.map((place, i) => {
                const globalIndex = campusResults.length + i
                const dist = getDistance(refPoint.lat, refPoint.lng, place.lat, place.lng)
                return (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceSelect(place)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-b last:border-0"
                    style={{
                      background: highlightedIndex === globalIndex ? 'var(--bg-secondary)' : 'var(--card)',
                      borderColor: 'var(--border)',
                    }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#f5f0ff', color: '#9D00FF' }}>
                      {CATEGORY_ICONS[place.category?.[0]] ?? (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{place.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{place.discount_description}</div>
                    </div>
                    <div className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {dist < 1 ? `${(dist * 5280).toFixed(0)}ft` : `${dist.toFixed(1)}mi`}
                    </div>
                  </button>
                )
              })}
            </>
          )}

          {allResults.length === 0 && query.length > 0 && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
