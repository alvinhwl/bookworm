export type LibraryView = 'all' | 'books' | 'collections'

interface LibraryViewToggleProps {
  view: LibraryView
  onChange: (view: LibraryView) => void
}

const options: { value: LibraryView; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'books', label: 'Books' },
  { value: 'collections', label: 'Collections' },
]

export function LibraryViewToggle({ view, onChange }: LibraryViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === opt.value
              ? 'bg-white text-amber-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}