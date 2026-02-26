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
    <div className="h-full overflow-y-auto px-4 py-4" style={{ background: 'var(--bg-secondary)' }}>
      <p className="text-xs mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {places.length} spots found
      </p>
      <div className="grid grid-cols-1 gap-3">
        {places.map(place => (
          <div
            key={place.id}
            onClick={() => onPlaceClick(place)}
            className="w-full text-left rounded-2xl p-4 shadow-sm border hover:border-purple-200 hover:shadow-md transition-all block cursor-pointer"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

            <div className="flex items-start justify-between gap-3">
              {/* Left */}
              <div className="flex-1">
                {/* Name */}
                <h3 className="font-bold text-sm mb-1"
                  style={{ fontFamily: 'var(--font-viga)', color: 'var(--text-primary)' }}>
                  {place.name}
                </h3>

                {/* Address */}
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{place.address}</p>

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
                <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {place.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>★</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {places.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
            <p className="text-sm font-medium">No spots found</p>
            <p className="text-xs mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  )
}
