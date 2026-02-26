'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { useTheme } from '@/lib/context/ThemeContext'

const CATEGORIES = ['food', 'coffee', 'drinks', 'museums', 'sports', 'theater', 'shopping']

type PlaceType = 'private' | 'public'

export default function AddPlacePage() {
  const [type, setType] = useState<PlaceType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<string[]>([])
  const [discount, setDiscount] = useState('')
  const [website, setWebsite] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [locatingUser, setLocatingUser] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
    }
    load()
  }, [])

  const fetchSuggestions = (input: string) => {
    if (input.length < 3) { setSuggestions([]); return }
    if (!window.google?.maps?.places) return

    const service = new google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      {
        input,
        locationBias: new google.maps.Circle({
          center: { lat: 41.8781, lng: -87.6298 },
          radius: 50000
        })
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
        }
      }
    )
  }

  const selectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    setAddress(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])

    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        setLat(loc.lat())
        setLng(loc.lng())
      }
    })
  }

  const geocodeAddress = async (addr: string) => {
    if (!addr || addr.length < 5) return
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await res.json()
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location
        setLat(lat)
        setLng(lng)
      }
    } catch (e) {}
  }

  const handleMapClick = async (e: any) => {
    const newLat = e.detail.latLng.lat
    const newLng = e.detail.latLng.lng
    setLat(newLat)
    setLng(newLng)

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await res.json()
      if (data.results?.[0]) {
        setAddress(data.results[0].formatted_address)
      }
    } catch (e) {}
  }

  const useCurrentLocation = () => {
    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude
        setLat(newLat)
        setLng(newLng)

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          const data = await res.json()
          if (data.results?.[0]) {
            setAddress(data.results[0].formatted_address)
          }
        } catch (e) {}
        setLocatingUser(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocatingUser(false)
      }
    )
  }

  const toggleCategory = (cat: string) => {
    setCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')

    if (!name) { setError('Name is required'); setSubmitting(false); return }
    if (!lat || !lng) { setError('Please pin a location on the map'); setSubmitting(false); return }

    if (type === 'private') {
      const { error } = await supabase.from('private_pins').insert({
        user_id: user.id,
        name,
        description,
        lat,
        lng,
        address,
      })
      if (error) setError(error.message)
      else setSuccess(true)
    } else {
      if (!category.length) { setError('Select at least one category'); setSubmitting(false); return }
      if (!discount) { setError('Discount description is required'); setSubmitting(false); return }
      if (!address) { setError('Address is required'); setSubmitting(false); return }

      const { error } = await supabase.from('places').insert({
        name,
        address,
        lat,
        lng,
        category,
        discount_description: discount,
        website: website || null,
        status: 'pending',
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        avg_rating: 0,
      })
      if (error) setError(error.message)
      else setSuccess(true)
    }
    setSubmitting(false)
  }

  if (success) return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-dm)' }}>
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
        <div className="text-5xl">{type === 'private' ? '📍' : '🎉'}</div>
        <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
          className="text-2xl">
          {type === 'private' ? 'Pin saved!' : 'Submitted!'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {type === 'private'
            ? 'Your private pin is now visible on your map.'
            : "Thanks for the submission! We'll review it and add it to the map soon."}
        </p>
        <button
          onClick={() => router.push('/map')}
          className="w-full text-white rounded-full py-4 text-sm font-bold"
          style={{ background: '#9D00FF' }}>
          Back to map →
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen pb-32"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-dm)' }}>

      {/* Nav */}
      <div className="flex items-center px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Add a Place
        </button>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6 max-w-lg mx-auto">

        {/* Type selection */}
        {!type ? (
          <>
            <div>
              <h1 style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}
                className="text-2xl mb-1">What kind of place?</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Private pins are just for you. Public places get reviewed and added for everyone.
              </p>
            </div>

            <button
              onClick={() => setType('private')}
              className="flex items-start gap-4 p-5 rounded-2xl border text-left transition-all hover:border-purple-400"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#9D00FF" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Private Pin
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Only you can see it. Great for saving your favorite hidden spots.
                </p>
              </div>
            </button>

            <button
              onClick={() => setType('public')}
              className="flex items-start gap-4 p-5 rounded-2xl border text-left transition-all hover:border-purple-400"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#9D00FF" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Submit to Yapa
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Share a student discount with the whole community. We'll review and approve it.
                </p>
              </div>
            </button>
          </>
        ) : (
          <>
            {/* Type badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setType(null)}
                style={{ color: '#9D00FF' }}
                className="text-xs underline">
                ← Change type
              </button>
              <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ background: '#9D00FF' }}>
                {type === 'private' ? 'Private Pin' : 'Public Submission'}
              </span>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>
                Name *
              </label>
              <input
                type="text"
                placeholder={type === 'private' ? 'My study spot' : 'Intelligentsia Coffee'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-full px-5 py-3 text-sm outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>
                Address {type === 'public' ? '*' : '(optional)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="53 W Jackson Blvd, Chicago"
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value)
                    fetchSuggestions(e.target.value)
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full rounded-full px-5 py-3 text-sm outline-none border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-50 shadow-xl"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onMouseDown={() => selectSuggestion(s)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left border-b last:border-0 hover:opacity-70 transition-all"
                        style={{ borderColor: 'var(--border)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#9D00FF" strokeWidth="2" className="shrink-0 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {s.structured_formatting?.main_text}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {s.structured_formatting?.secondary_text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Use current location button */}
            <button
              onClick={useCurrentLocation}
              disabled={locatingUser}
              className="w-full flex items-center justify-center gap-2 rounded-full py-3 border transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              {locatingUser ? (
                <>
                  <span className="text-sm animate-spin">⟳</span>
                  <span className="text-sm font-semibold">Getting location...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-sm font-semibold">Use current location</span>
                </>
              )}
            </button>

            {/* Map pin */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}>
                Pin Location * <span className="normal-case font-normal">(tap map to pin)</span>
              </label>
              <div className="rounded-2xl overflow-hidden border"
                style={{ height: 220, borderColor: 'var(--border)' }}>
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
                  <Map
                    mapId="9572d59f0ba67a57f25bf982"
                    defaultCenter={{ lat: 41.8781, lng: -87.6298 }}
                    defaultZoom={12}
                    colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                    gestureHandling="greedy"
                    onClick={handleMapClick}
                    streetViewControl={false}
                    fullscreenControl={false}
                    zoomControl={false}
                    mapTypeControl={false}>
                    {lat && lng && (
                      <AdvancedMarker position={{ lat, lng }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: '#9D00FF', border: '2px solid white',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }} />
                      </AdvancedMarker>
                    )}
                  </Map>
                </APIProvider>
              </div>
              {lat && lng && (
                <p className="text-xs px-2" style={{ color: 'var(--text-secondary)' }}>
                  Pinned at {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Description — private only */}
            {type === 'private' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}>
                  Description (optional)
                </label>
                <textarea
                  placeholder="Notes about this spot..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none border resize-none"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            {/* Public-only fields */}
            {type === 'public' && (
              <>
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="px-4 py-2 rounded-full text-xs font-semibold border capitalize transition-all"
                        style={{
                          background: category.includes(cat) ? '#9D00FF' : 'var(--card)',
                          color: category.includes(cat) ? 'white' : 'var(--text-primary)',
                          borderColor: category.includes(cat) ? '#9D00FF' : 'var(--border)'
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>
                    Student Discount *
                  </label>
                  <input
                    type="text"
                    placeholder="15% off with .edu email"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    className="w-full rounded-full px-5 py-3 text-sm outline-none border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Website */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full rounded-full px-5 py-3 text-sm outline-none border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-xs px-2">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Fixed submit button */}
      {type && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-6 border-t"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full text-white rounded-full py-4 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: '#9D00FF' }}>
            {submitting
              ? 'Saving...'
              : type === 'private'
                ? 'Save private pin →'
                : 'Submit for review →'
            }
          </button>
        </div>
      )}
    </main>
  )
}
