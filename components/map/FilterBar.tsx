'use client'

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Food', value: 'food' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Drinks', value: 'drinks' },
  { label: 'Museums', value: 'museums' },
  { label: 'Sports', value: 'sports' },
  { label: 'Theater', value: 'theater' },
]

interface FilterBarProps {
  selected: string
  onChange: (category: string) => void
}

export default function FilterBar({ selected, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-all"
          style={{
            background: selected === value ? '#9D00FF' : '#ffffff',
            color: selected === value ? '#ffffff' : '#111',
            borderColor: selected === value ? '#9D00FF' : '#e5e7eb',
          }}>
          {label}
        </button>
      ))}
    </div>
  )
}
