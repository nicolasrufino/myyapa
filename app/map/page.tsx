'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import FilterBar from '@/components/map/FilterBar'
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
  const [category, setCategory] = useState('all')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [selectedPlaceCenter, setSelectedPlaceCenter] = useState<{ lat: number, lng: number } | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

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

  const locateUser = () => {
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

  const filteredPlaces = category === 'all' ? places : places.filter(p => p.category.includes(category))

  const mapActivePlaceIds: string[] | undefined =
    selectedPlace
      ? [selectedPlace.id]
      : category !== 'all'
        ? filteredPlaces.map(p => p.id)
        : undefined

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place)
    setSelectedPlaceCenter({ lat: place.lat, lng: place.lng })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">

      {/* TOP NAV */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-0 z-10 shrink-0">

        {/* Row 1 — logo + search + avatar */}
        <div className="flex items-center gap-3 mb-3">
          <Link href="/" style={{ fontFamily: 'var(--font-viga)' }}
            className="text-xl text-gray-900 shrink-0">
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

          {/* Locate button */}
          <button
            onClick={locateUser}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-purple-400 transition-all shrink-0"
            title="Use my location">
            {locating ? (
              <span className="text-xs animate-spin">⟳</span>
            ) : (
              <svg className="w-4 h-4" style={{ color: userLocation ? '#9D00FF' : '#9ca3af' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>

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

        {/* Row 2 — Map / Discover tabs + filters */}
        <div className="flex items-center gap-4 mb-0">
          {/* Tabs */}
          <div className="flex shrink-0 border-b-0">
            {(['map', 'discover'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-all"
                style={{
                  borderColor: tab === t ? '#9D00FF' : 'transparent',
                  color: tab === t ? '#9D00FF' : '#9ca3af',
                }}>
                {t === 'map' ? 'Map' : 'Discover'}
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex-1 overflow-x-auto pb-2">
            <FilterBar selected={category} onChange={setCategory} />
          </div>
        </div>
      </div>

      {/* Campus banner */}
      {campusName && (
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-purple-700">
            Showing spots near {campusName}
          </span>
          <Link href="/map" className="text-xs text-purple-400 hover:text-purple-600">
            Clear
          </Link>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {loadingPlaces ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-sm text-gray-400">Loading spots...</div>
          </div>
        ) : tab === 'map' ? (
          <MapView
            places={places}
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
      <PlaceDrawer
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
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
