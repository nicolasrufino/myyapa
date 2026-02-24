'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import FilterBar from '@/components/map/FilterBar'
import PlaceDrawer from '@/components/map/PlaceDrawer'

// Load map client-side only
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

// Sample places for now until we add real data
const SAMPLE_PLACES: Place[] = [
  {
    id: '1',
    name: 'Intelligentsia Coffee',
    lat: 41.8948,
    lng: -87.6365,
    discount_description: '15% off all drinks',
    category: ['coffee', 'drinks'],
    avg_rating: 4.5,
    address: '53 W Jackson Blvd, Chicago'
  },
  {
    id: '2',
    name: 'Cafecito',
    lat: 41.8756,
    lng: -87.6244,
    discount_description: '10% off orders',
    category: ['coffee', 'food'],
    avg_rating: 4.3,
    address: '26 E Congress Pkwy, Chicago'
  },
  {
    id: '3',
    name: 'Pizano\'s Pizza',
    lat: 41.8827,
    lng: -87.6278,
    discount_description: '20% off with student ID',
    category: ['food'],
    avg_rating: 4.4,
    address: '61 E Madison St, Chicago'
  },
]

export default function MapPage() {
  const searchParams = useSearchParams()
  const campusLat = searchParams.get('lat')
  const campusLng = searchParams.get('lng')

  const [category, setCategory] = useState('all')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [places, setPlaces] = useState<Place[]>(SAMPLE_PLACES)

  const filteredPlaces = category === 'all'
    ? places
    : places.filter(p => p.category.includes(category))

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" style={{ fontFamily: 'var(--font-viga)' }}
            className="text-xl text-gray-900">
            my<span style={{ color: '#9D00FF' }}>Yapa</span>
          </Link>
          <Link href="/auth/login"
            className="text-xs font-semibold text-white px-4 py-2 rounded-full"
            style={{ background: '#9D00FF' }}>
            Sign in
          </Link>
        </div>
        <FilterBar selected={category} onChange={setCategory} />
      </div>

      {/* Map — fills entire screen */}
      <div className="w-full h-full pt-[104px]">
        <MapView
          places={filteredPlaces}
          onPlaceClick={setSelectedPlace}
          selectedPlace={selectedPlace}
          center={campusLat && campusLng ? { lat: parseFloat(campusLat), lng: parseFloat(campusLng) } : undefined}
        />
      </div>

      {/* Place drawer */}
      <PlaceDrawer
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

    </div>
  )
}