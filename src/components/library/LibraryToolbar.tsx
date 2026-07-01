import { SearchBar } from './SearchBar'
import { FilterChips } from './FilterChips'
import type { BookFormat, ReadingStatus } from '@/types'

interface LibraryToolbarProps {
  search: string
  status: ReadingStatus | null
  format: BookFormat | null
  onSearchChange: (q: string) => void
  onStatusChange: (s: ReadingStatus | null) => void
  onFormatChange: (f: BookFormat | null) => void
  onClearAll: () => void
}

export function LibraryToolbar({
  search,
  status,
  format,
  onSearchChange,
  onStatusChange,
  onFormatChange,
  onClearAll,
}: LibraryToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <SearchBar value={search} onChange={onSearchChange} />
      <FilterChips
        status={status}
        format={format}
        onStatusChange={onStatusChange}
        onFormatChange={onFormatChange}
        onClearAll={onClearAll}
      />
    </div>
  )
}