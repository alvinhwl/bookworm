import { SearchBar } from './SearchBar'
import { FilterChips } from './FilterChips'
import { Badge } from '@/components/ui/Badge'
import type { BookFormat, ReadingStatus } from '@/types'

interface LibraryToolbarProps {
  search: string
  status: ReadingStatus | null
  format: BookFormat | null
  tags: string[]
  allTags: string[]
  onSearchChange: (q: string) => void
  onStatusChange: (s: ReadingStatus | null) => void
  onFormatChange: (f: BookFormat | null) => void
  onToggleTag: (tag: string) => void
  onClearAll: () => void
}

export function LibraryToolbar({
  search,
  status,
  format,
  tags,
  allTags,
  onSearchChange,
  onStatusChange,
  onFormatChange,
  onToggleTag,
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
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = tags.includes(tag)
            return (
              <button key={tag} type="button" onClick={() => onToggleTag(tag)}>
                <Badge variant={active ? 'default' : 'muted'}>{tag}</Badge>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}