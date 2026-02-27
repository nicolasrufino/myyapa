'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SavedPlacesPage() {
  const [saved, setSaved] = useState<any[]>([])
  const [pins, setPins] = useState<any[]>([])
  const [tab, setTab] = useState<'favorites' | 'pins'>('favorites')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: savedData }, { data: pinsData }] = await Promise.all([
        supabase.from('saved_places').select('*, places(*)').eq('user_id', user.id),
        supabase.from('private_pins').select('*').eq('user_id', user.id)
      ])

      setSaved(savedData || [])
      setPins(pinsData || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link href="/profile"
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-5" style={{ borderColor: 'var(--border)' }}>
        {(['favorites', 'pins'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="py-3 px-4 text-sm font-semibold capitalize border-b-2 -mb-px transition-all"
            style={{
              borderColor: tab === t ? '#9D00FF' : 'transparent',
              color: tab === t ? '#9D00FF' : 'var(--text-secondary)'
            }}>
            {t === 'favorites' ? `Favorites (${saved.length})` : `My Pins (${pins.length})`}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#9D00FF', borderTopColor: 'transparent' }} />
          </div>
        ) : tab === 'favorites' ? (
          saved.length === 0 ? (
            <EmptyState icon="🤍" message="No favorites yet" sub="Heart a place on the map to save it here" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {saved.map(s => (
                <PlaceCard key={s.id} place={s.places} />
              ))}
            </div>
          )
        ) : (
          pins.length === 0 ? (
            <EmptyState icon="📍" message="No private pins yet" sub="Add pins on the map to track your own spots" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pins.map(pin => (
                <PinCard key={pin.id} pin={pin} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function PlaceCard({ place }: { place: any }) {
  return (
    <div className="rounded-2xl border overflow-hidden cursor-pointer hover:opacity-80 transition-all"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-full h-24 flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}>
        {place.image_url
          ? <img src={place.image_url} alt={place.name} className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          : <span className="text-3xl">📍</span>
        }
      </div>
      <div className="p-3">
        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{place.name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{place.address}</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ background: '#9D00FF' }}>
          {place.discount_description}
        </span>
      </div>
    </div>
  )
}

function PinCard({ pin }: { pin: any }) {
  return (
    <div className="rounded-2xl border p-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={{ background: pin.color || '#9D00FF' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{pin.name}</p>
      {pin.address && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{pin.address}</p>}
      {pin.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{pin.description}</p>}
    </div>
  )
}

function EmptyState({ icon, message, sub }: { icon: string, message: string, sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{message}</p>
      <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}
