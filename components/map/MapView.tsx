'use client'

import { useEffect } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'

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
  onPlaceClick: (place: Place) => void
  selectedPlace: Place | null
  center?: { lat: number, lng: number }
}

// Inner component that has access to the map instance
function MapContent({ places, onPlaceClick, selectedPlace, center }: MapViewProps) {
  const map = useMap()

  useEffect(() => {
    if (map && center) {
      map.panTo(center)
      map.setZoom(15)
    }
  }, [map, center])

  return (
    <>
      {places.map(place => (
        <AdvancedMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          onClick={() => onPlaceClick(place)}>
          <Pin
            background={selectedPlace?.id === place.id ? '#9D00FF' : '#ffffff'}
            borderColor={selectedPlace?.id === place.id ? '#7a00cc' : '#9D00FF'}
            glyphColor={selectedPlace?.id === place.id ? '#ffffff' : '#9D00FF'}
          />
        </AdvancedMarker>
      ))}
    </>
  )
}

export default function MapView({ places, onPlaceClick, selectedPlace, center }: MapViewProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: 41.8781, lng: -87.6298 }}
        defaultZoom={13}
        mapId="yapa-map"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy">
        <MapContent
          places={places}
          onPlaceClick={onPlaceClick}
          selectedPlace={selectedPlace}
          center={center}
        />
      </Map>
    </APIProvider>
  )
}