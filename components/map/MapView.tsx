'use client'

import { useEffect, useRef } from 'react'
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
  selectedPlace: Place | null
  center?: { lat: number, lng: number }
  activePlaceIds?: string[]
}

function MapContent({ places, privatePins, onPlaceClick, selectedPlace, center, activePlaceIds }: MapViewProps) {
  const map = useMap()
  const prevCenter = useRef<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    if (!map || !center) return
    if (
      prevCenter.current?.lat === center.lat &&
      prevCenter.current?.lng === center.lng
    ) return
    prevCenter.current = center
    map.panTo(center)
    map.setZoom(15)
  }, [map, center])

  return (
    <>
      {places.map(place => (
        <AdvancedMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          onClick={() => onPlaceClick(place)}>
          <Pin
            background={
              selectedPlace?.id === place.id
                ? '#7a00cc'
                : activePlaceIds && !activePlaceIds.includes(place.id)
                  ? '#D8B4FE'
                  : '#9D00FF'
            }
            borderColor={
              selectedPlace?.id === place.id
                ? '#5a0099'
                : activePlaceIds && !activePlaceIds.includes(place.id)
                  ? '#c084fc'
                  : '#7a00cc'
            }
            glyphColor='#ffffff'
          />
        </AdvancedMarker>
      ))}
      {privatePins?.map(pin => (
        <AdvancedMarker
          key={pin.id}
          position={{ lat: pin.lat, lng: pin.lng }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: 'white',
            border: '2px solid #9D00FF',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }} />
        </AdvancedMarker>
      ))}
    </>
  )
}

export default function MapView({ places, privatePins, onPlaceClick, selectedPlace, center, activePlaceIds }: MapViewProps) {
  const { theme } = useTheme()
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
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
          selectedPlace={selectedPlace}
          center={center}
          activePlaceIds={activePlaceIds}
        />
      </Map>
    </APIProvider>
  )
}