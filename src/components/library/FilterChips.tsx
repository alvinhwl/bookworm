import type { BookFormat, ReadingStatus } from '@/types'
import { READING_STATUS_LABELS, FORMAT_LABELS } from '@/utils/status'
import { X } from 'lucide-react'

interface FilterChipsProps {
  status: ReadingStatus | null
  format: BookFormat | null
  onStatusChange: (status: ReadingStatus | null) => void
  onFormatChange: (format: BookFormat | null) => void
  onClearAll: () => void
}

const statuses: ReadingStatus[] = [
  'want_to_read',
  'currently_reading',
  'finished',
  'dnf',
]

const formats: BookFormat[] = ['physical', 'ebook', 'audiobook']

export function FilterChips({
  status,
  format,
  onStatusChange,
  onFormatChange,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = status || format

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium uppercase tracking-wide text-stone-500">
          Status
        </span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(status === s ? null : s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {READING_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium uppercase tracking-wide text-stone-500">
          Format
        </span>
        {formats.map((f) => (
          <button
            key={f}
            onClick={() => onFormatChange(format === f ? null : f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              format === f
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {FORMAT_LABELS[f]}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 text-sm text-amber-800 hover:text-amber-900"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  )
}