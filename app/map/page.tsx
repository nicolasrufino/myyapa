'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useTheme } from '@/lib/context/ThemeContext'
import PlaceDrawer from '@/components/map/PlaceDrawer'
import PrivatePinDrawer from '@/components/map/PrivatePinDrawer'
import DiscoverView from '@/components/map/DiscoverView'
import UnifiedSearch from '@/components/map/UnifiedSearch'
import { createClient } from '@/lib/supabase/client'
import { CHICAGO_CAMPUSES } from '@/lib/campuses'


const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

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


function MapPageContent() {
  const [tab, setTab] = useState<'map' | 'discover'>('map')
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all'])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [privatePins, setPrivatePins] = useState<any[]>([])
  const [selectedPrivatePin, setSelectedPrivatePin] = useState<any>(null)
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [selectedPlaceCenter, setSelectedPlaceCenter] = useState<{ lat: number, lng: number } | null>(null)
  const [navHeight, setNavHeight] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { theme } = useTheme()

  const campusLat = searchParams.get('lat')
  const campusLng = searchParams.get('lng')
  const campusName = searchParams.get('name')
  const requestLocation = searchParams.get('requestLocation')

  useEffect(() => {
    if (requestLocation === 'true') {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [requestLocation])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('username, preferred_campuses')
          .eq('id', user.id)
          .single()
        setUserProfile(data)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, address, lat, lng, category, discount_description, avg_rating')

      if (error) {
        console.error('Error fetching places:', error)
      } else {
        setPlaces(data || [])
      }
      setLoadingPlaces(false)
    }

    fetchPlaces()
  }, [])

  useEffect(() => {
    const fetchPrivatePins = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('private_pins')
        .select('*')
        .eq('user_id', user.id)
      setPrivatePins(data || [])
    }
    fetchPrivatePins()
  }, [])

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('saved_places')
        .select('place_id')
        .eq('user_id', user.id)
      setSavedPlaceIds((data || []).map((r: any) => r.place_id))
    }
    fetchSaved()
  }, [])

  // Measure nav height so the drawer can align to the map area
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setNavHeight(el.offsetHeight))
    ro.observe(el)
    setNavHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  const locateUser = () => {
    // Toggle location on/off
    if (userLocation) {
      setUserLocation(null)
      return
    }
    
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        console.error(err)
        setLocating(false)
      }
    )
  }

  const userCampuses = (userProfile?.preferred_campuses ?? [])
    .map((id: string) => CHICAGO_CAMPUSES.find(c => c.id === id))
    .filter(Boolean)
    .map((c: any) => ({ lat: c.lat, lng: c.lng, name: c.name }))

  const filteredPlaces = selectedFilters.includes('all')
    ? places 
    : places.filter(p => p.category.some(cat => selectedFilters.includes(cat)))

  const mapActivePlaceIds: string[] | undefined =
    selectedPlace
      ? [selectedPlace.id]
      : !selectedFilters.includes('all')
        ? filteredPlaces.map(p => p.id)
        : undefined

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      if (filter === 'all') {
        return ['all']
      }
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : prev.filter(f => f !== 'all').concat(filter)
      return newFilters.length === 0 ? ['all'] : newFilters
    })
  }

  const handlePlaceSelect = (place: Place) => {
    console.log('handlePlaceSelect called:', place.name)
    setSelectedPlace(place)
    setSelectedPlaceCenter({ lat: place.lat, lng: place.lng })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">

      {/* TOP NAV */}
      <div ref={navRef} className="border-b px-4 pt-2 pb-0 z-10 shrink-0"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>

        {/* Row 1 — logo + search + avatar */}
        <div className="flex items-center gap-3 mb-1">
          <Link href="/" style={{ fontFamily: 'var(--font-viga)' }}
            className="text-xl text-gray-900 dark:text-white shrink-0">
            my<span style={{ color: '#9D00FF' }}>Yapa</span>
          </Link>

          {/* Unified search */}
          <UnifiedSearch
            places={places}
            onPlaceSelect={handlePlaceSelect}
            userLocation={userLocation}
            campusCenter={campusLat && campusLng ? { lat: parseFloat(campusLat), lng: parseFloat(campusLng) } : null}
            campusName={campusName}
          />

          {/* Avatar or sign in */}
          {user ? (
            <Link href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: '#9D00FF' }}>
              {userProfile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </Link>
          ) : (
            <Link href="/auth/login"
              className="text-xs font-semibold text-white px-3 py-2 rounded-full shrink-0"
              style={{ background: '#9D00FF' }}>
              Sign in
            </Link>
          )}
        </div>

        {/* Tabs + location + filters row */}
        <div className="flex items-center px-1 border-b relative"
          style={{ borderColor: 'var(--border)' }}>

          {/* Tabs — centered */}
          <div className="flex items-center mx-auto">
            {(['map', 'discover'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="py-3 px-4 text-sm font-semibold capitalize border-b-2 -mb-px transition-all"
                style={{
                  borderColor: tab === t ? '#9D00FF' : 'transparent',
                  color: tab === t ? '#9D00FF' : '#9ca3af',
                }}>
                {t === 'map' ? 'Map' : 'Discover'}
              </button>
            ))}
          </div>

          {/* Pills — absolute right */}
          <div className="absolute right-1 flex items-center gap-2">

          {/* Location pill */}
          <button
            onClick={locateUser}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={{
              background: userLocation ? (theme === 'dark' ? '#2a1a4a' : '#f5f0ff') : 'var(--card)',
              borderColor: userLocation ? '#9D00FF' : 'var(--border)',
              color: userLocation ? '#9D00FF' : 'var(--text-primary)',
            }}>
            {locating ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            )}
            {locating ? 'Locating...' : userLocation ? 'Near you ✕' : 'My location'}
          </button>

          {/* Campus pill — only when active and no GPS */}
          {campusName && !userLocation && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: theme === 'dark' ? '#2a1a4a' : '#f5f0ff',
                borderColor: '#9D00FF',
                color: '#9D00FF',
              }}>
              {campusName}
              <Link href="/map" className="opacity-60 hover:opacity-100">✕</Link>
            </div>
          )}

          {/* Filters button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                background: !selectedFilters.includes('all') ? (theme === 'dark' ? '#2a1a4a' : '#f5f0ff') : 'var(--card)',
                color: !selectedFilters.includes('all') ? '#9D00FF' : 'var(--text-primary)',
                borderColor: !selectedFilters.includes('all') ? '#9D00FF' : 'var(--border)',
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 4h18M7 12h10M11 20h2"/>
              </svg>
              Filters
            </button>

            {showFilters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                <div className="absolute top-full right-0 mt-1 rounded-2xl border shadow-lg overflow-hidden z-50"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex flex-col w-40">
                    {[{ label: 'All', value: 'all' }, { label: 'Food', value: 'food' }, { label: 'Coffee', value: 'coffee' }, { label: 'Drinks', value: 'drinks' }, { label: 'Museums', value: 'museums' }, { label: 'Sports', value: 'sports' }, { label: 'Theater', value: 'theater' }].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => toggleFilter(value)}
                        className="px-4 py-3 text-left text-sm font-semibold border-b last:border-0 transition-opacity hover:opacity-70"
                        style={{
                          borderColor: 'var(--border)',
                          color: selectedFilters.includes(value) ? '#9D00FF' : 'var(--text-primary)',
                        }}>
                        <span className="flex items-center gap-2">
                          {selectedFilters.includes(value) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#9D00FF">
                              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                            </svg>
                          )}
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          </div>{/* end pills wrapper */}
        </div>{/* end row */}
      </div>{/* end nav */}

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {loadingPlaces ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading spots...</div>
          </div>
        ) : tab === 'map' ? (
          <MapView
            places={places}
            privatePins={privatePins}
            onPlaceClick={handlePlaceSelect}
            onPrivatePinClick={setSelectedPrivatePin}
            selectedPlace={selectedPlace}
            activePlaceIds={mapActivePlaceIds}
            userLocation={userLocation}
            savedPlaceIds={savedPlaceIds}
            center={
              selectedPlaceCenter ||
              (campusLat && campusLng
                ? { lat: parseFloat(campusLat), lng: parseFloat(campusLng) }
                : userLocation || undefined)
            }
          />
        ) : (
          <DiscoverView
            places={filteredPlaces}
            onPlaceClick={handlePlaceSelect}
            userLocation={userLocation}
            campusCenters={userCampuses}
          />
        )}
      </div>

      {/* Place drawer */}
      {selectedPlace && (
        <PlaceDrawer
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          navHeight={navHeight}
        />
      )}

      {/* Private pin drawer */}
      {selectedPrivatePin && (
        <PrivatePinDrawer
          pin={selectedPrivatePin}
          onClose={() => setSelectedPrivatePin(null)}
          onDelete={(id) => setPrivatePins(prev => prev.filter(p => p.id !== id))}
        />
      )}

      {/* Add place button */}
      <div className="fixed bottom-6 left-6 z-30 group">
        <Link href="/places/add"
          title="Add location"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:opacity-90"
          style={{ background: '#9D00FF' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
          </svg>
        </Link>
        <div className="absolute left-16 bottom-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: '#1a1a1a' }}>
          Add location
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense>
      <MapPageContent />
    </Suspense>
  )
}
