'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useTheme } from '@/lib/context/ThemeContext'
import PlaceDrawer from '@/components/map/PlaceDrawer'
import DiscoverView from '@/components/map/DiscoverView'
import UnifiedSearch from '@/components/map/UnifiedSearch'
import { createClient } from '@/lib/supabase/client'


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
  const [loadingPlaces, setLoadingPlaces] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [selectedPlaceCenter, setSelectedPlaceCenter] = useState<{ lat: number, lng: number } | null>(null)
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
          .select('username')
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
    setSelectedPlace(place)
    setSelectedPlaceCenter({ lat: place.lat, lng: place.lng })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">

      {/* TOP NAV */}
      <div className="border-b px-4 pt-2 pb-0 z-10 shrink-0"
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

        {/* Row 2 — Map / Discover tabs + location + filters */}
        <div className="flex items-center justify-center gap-4 border-b relative mt-6 py-2"
          style={{ borderColor: 'var(--border)' }}>
          {/* Location button - absolute positioned on left */}
          <div className="absolute left-4">
            <button
              onClick={locateUser}
              disabled={locating}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{
                background: userLocation ? (theme === 'dark' ? '#2a1a4a' : '#f5f0ff') : 'var(--card)',
                color: userLocation ? '#9D00FF' : 'var(--text-primary)',
                borderColor: userLocation ? '#9D00FF' : 'var(--border)',
              }}>
              {locating ? (
                <>
                  <span className="text-xs animate-spin">⟳</span>
                  <span>Using location...</span>
                </>
              ) : userLocation ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Using current location</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Use location</span>
                </>
              )}
            </button>
          </div>

          {/* Tabs — centered */}
          <div className="flex shrink-0 border-b-0 pb-0">
            {(['map', 'discover'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-4 text-base font-semibold capitalize border-b-2 transition-all"
                style={{
                  borderColor: tab === t ? '#9D00FF' : 'transparent',
                  color: tab === t ? '#9D00FF' : '#9ca3af',
                }}>
                {t === 'map' ? 'Map' : 'Discover'}
              </button>
            ))}
          </div>

          {/* Filters button - absolute positioned on right */}
          <div className="absolute right-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{
                background: !selectedFilters.includes('all') ? 'var(--bg-secondary)' : 'var(--card)',
                color: !selectedFilters.includes('all') ? '#9D00FF' : 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filters
            </button>

            {/* Filter dropdown - stays open until clicked outside */}
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
        </div>
      </div>

      {/* Campus banner */}
      {campusName && (
        <div className="border-b px-4 py-2 flex items-center justify-between shrink-0"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold" style={{ color: '#9D00FF' }}>
            Showing spots near {campusName}
          </span>
          <Link href="/map" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Clear
          </Link>
        </div>
      )}

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
            selectedPlace={selectedPlace}
            activePlaceIds={mapActivePlaceIds}
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
            onPlaceClick={setSelectedPlace}
          />
        )}
      </div>

      {/* Place drawer */}
      {selectedPlace && (
        <PlaceDrawer
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
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
