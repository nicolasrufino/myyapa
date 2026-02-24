'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import FilterBar from '@/components/map/FilterBar'
import PlaceDrawer from '@/components/map/PlaceDrawer'
import DiscoverView from '@/components/map/DiscoverView'
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
  const [search, setSearch] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  const campusLat = searchParams.get('lat')
  const campusLng = searchParams.get('lng')
  const campusName = searchParams.get('name')

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

  const filteredPlaces = places.filter(place => {
    const matchesCategory = category === 'all' || place.category.includes(category)
    const matchesSearch = search === '' ||
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.discount_description.toLowerCase().includes(search.toLowerCase()) ||
      place.category.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
      place.address.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search matcha, museums, pizza..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            )}
          </div>

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
            places={filteredPlaces}
            onPlaceClick={setSelectedPlace}
            selectedPlace={selectedPlace}
            center={
              campusLat && campusLng
                ? { lat: parseFloat(campusLat), lng: parseFloat(campusLng) }
                : userLocation || undefined
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
