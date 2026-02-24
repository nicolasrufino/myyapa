'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHICAGO_CAMPUSES, Campus } from '@/lib/campuses'

export default function CampusSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Campus[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    const q = query.toLowerCase()
    const filtered = CHICAGO_CAMPUSES.filter(campus =>
      campus.name.toLowerCase().includes(q) ||
      campus.university.toLowerCase().includes(q) ||
      campus.aliases?.some(a => a.includes(q))
    )
    setResults(filtered)
    setOpen(filtered.length > 0)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (campus: Campus) => {
    setQuery(campus.name)
    setOpen(false)
    router.push(`/map?campus=${campus.id}&lat=${campus.lat}&lng=${campus.lng}&name=${encodeURIComponent(campus.name)}`)
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* Search input */}
      <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 flex-1">
          <svg className="w-5 h-5 shrink-0 text-gray-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your campus or university"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => results.length > 0 && handleSelect(results[0])}
          className="text-white text-sm font-bold px-6 py-4 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ background: '#9D00FF' }}>
          Find Deals →
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-y-auto z-[200] max-h-72">
          {results.map(campus => (
            <button
              key={campus.id}
              onClick={() => handleSelect(campus)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-all text-left border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#f5f0ff' }}>
                <span style={{ color: '#9D00FF' }} className="text-sm">🎓</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{campus.name}</div>
                <div className="text-xs text-gray-500">{campus.university}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}