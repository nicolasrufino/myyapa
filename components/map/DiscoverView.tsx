'use client'

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

interface DiscoverViewProps {
  places: Place[]
  onPlaceClick: (place: Place) => void
}

export default function DiscoverView({ places, onPlaceClick }: DiscoverViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-4 py-4">
      <p className="text-xs text-gray-400 mb-4 font-medium">
        {places.length} spots found
      </p>
      <div className="grid grid-cols-1 gap-3">
        {places.map(place => (
          <button
            key={place.id}
            onClick={() => onPlaceClick(place)}
            className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">

            <div className="flex items-start justify-between gap-3">
              {/* Left */}
              <div className="flex-1">
                {/* Name */}
                <h3 className="font-bold text-gray-900 text-sm mb-1"
                  style={{ fontFamily: 'var(--font-viga)' }}>
                  {place.name}
                </h3>

                {/* Address */}
                <p className="text-xs text-gray-400 mb-2">{place.address}</p>

                {/* Discount badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: '#9D00FF' }}>
                    {place.discount_description}
                  </div>
                </div>
              </div>

              {/* Right — rating */}
              {place.avg_rating > 0 && (
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl px-3 py-2 shrink-0">
                  <span className="text-sm font-bold text-gray-900">
                    {place.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">★</span>
                </div>
              )}
            </div>
          </button>
        ))}

        {places.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-medium">No spots found</p>
            <p className="text-xs mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  )
}
