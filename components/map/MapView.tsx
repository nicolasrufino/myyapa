'use client'

import { useEffect, useRef, useState } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import { useTheme } from '@/lib/context/ThemeContext'


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

interface MapViewProps {
  places: Place[]
  privatePins?: any[]
  onPlaceClick: (place: Place) => void
  onPrivatePinClick?: (pin: any) => void
  selectedPlace: Place | null
  center?: { lat: number, lng: number }
  activePlaceIds?: string[]
  userLocation?: { lat: number, lng: number } | null
  savedPlaceIds?: string[]
}

function MapContent({ places, privatePins, onPlaceClick, onPrivatePinClick, selectedPlace, center, activePlaceIds, userLocation, savedPlaceIds }: MapViewProps) {
  // No ID argument — gets the nearest Map instance from context
  const map = useMap()
  const prevCenter = useRef<{ lat: number, lng: number } | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pan to selected place — zoom to 16 if needed
  useEffect(() => {
    if (!map || !selectedPlace) return
    console.log('panning to:', selectedPlace.name)
    if ((map.getZoom() ?? 0) < 16) map.setZoom(16)
    map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng })
    prevCenter.current = { lat: selectedPlace.lat, lng: selectedPlace.lng }
  }, [map, selectedPlace])

  // Pan to campus / user location — no zoom, deduplicated
  useEffect(() => {
    if (!map || !center) return
    if (
      prevCenter.current?.lat === center.lat &&
      prevCenter.current?.lng === center.lng
    ) return
    prevCenter.current = center
    map.panTo(center)
  }, [map, center])

  return (
    <>
      {/* User location blue dot */}
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: '#3b82f6',
            border: '3px solid white',
            boxShadow: '0 0 0 4px rgba(59,130,246,0.3)'
          }} />
        </AdvancedMarker>
      )}

      {/* Place pins */}
      {places.map(place => {
        const isSaved = savedPlaceIds?.includes(place.id)
        const isActive = !activePlaceIds || activePlaceIds.includes(place.id)
        const isSelected = selectedPlace?.id === place.id

        return (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => onPlaceClick(place)}>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => {
                hoverTimer.current = setTimeout(() => setHoveredId(place.id), 2000)
              }}
              onMouseLeave={() => {
                if (hoverTimer.current) clearTimeout(hoverTimer.current)
                setHoveredId(null)
              }}>
              <Pin
                background={isSelected ? '#7a00cc' : isActive ? '#9D00FF' : '#D8B4FE'}
                borderColor={isSelected ? '#5a0099' : isActive ? '#7a00cc' : '#c084fc'}
                glyph={isSaved ? '♥' : undefined}
                glyphColor={isSaved ? '#ffffff' : '#000000'}
              />
              {hoveredId === place.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '130%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  pointerEvents: 'none',
                }}>
                  <p style={{ color: '#111827', fontSize: 12, fontWeight: 700, margin: 0 }}>
                    {place.name}
                  </p>
                  <p style={{ color: '#9D00FF', fontSize: 11, margin: '2px 0 0' }}>
                    {place.discount_description}
                  </p>
                </div>
              )}
            </div>
          </AdvancedMarker>
        )
      })}

      {/* Private pins — colored diamond (rotated square) */}
      {privatePins?.map(pin => (
        <AdvancedMarker
          key={pin.id}
          position={{ lat: pin.lat, lng: pin.lng }}
          onClick={() => onPrivatePinClick?.(pin)}>
          <div style={{
            width: 14, height: 14,
            borderRadius: 3,
            background: pin.color || '#9D00FF',
            border: '2px solid white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            transform: 'rotate(45deg)',
            cursor: 'pointer',
          }} />
        </AdvancedMarker>
      ))}
    </>
  )
}

export default function MapView({ places, privatePins, onPlaceClick, onPrivatePinClick, selectedPlace, center, activePlaceIds, userLocation, savedPlaceIds }: MapViewProps) {
  const { theme } = useTheme()
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
      <Map
        defaultCenter={{ lat: 41.8781, lng: -87.6298 }}
        defaultZoom={13}
        mapId="9572d59f0ba67a57f25bf982"
        colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
        streetViewControl={false}
        fullscreenControl={false}
        zoomControl={false}
        mapTypeControl={false}
        scaleControl={false}
        rotateControl={false}
        keyboardShortcuts={false}
        minZoom={11}
        maxZoom={17}>
        <MapContent
          places={places}
          privatePins={privatePins}
          onPlaceClick={onPlaceClick}
          onPrivatePinClick={onPrivatePinClick}
          selectedPlace={selectedPlace}
          center={center}
          activePlaceIds={activePlaceIds}
          userLocation={userLocation}
          savedPlaceIds={savedPlaceIds}
        />
      </Map>
    </APIProvider>
  )
}
