import type { Collection, CollectionStats } from '@/types'
import { BookCover } from '@/components/book/BookCover'
import { ChevronRight } from 'lucide-react'

interface CollectionListItemProps {
  collection: Collection
  stats: CollectionStats
  onSelect: (id: string) => void
}

export function CollectionListItem({
  collection,
  stats,
  onSelect,
}: CollectionListItemProps) {
  const coverBook = {
    id: collection.id,
    title: collection.name,
    author: collection.author,
    cover_url: collection.cover_url,
    format: 'physical' as const,
    status: 'want_to_read' as const,
    isbn: null,
    published_year: null,
    total_pages: null,
    total_duration_minutes: null,
    current_progress: 0,
    notes: '',
    started_at: null,
    finished_at: null,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
  }

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onSelect(collection.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(collection.id)
        }
      }}
    >
      <BookCover book={coverBook} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-stone-900">{collection.name}</h3>
        <p className="truncate text-sm text-stone-500">{collection.author}</p>
        <p className="mt-2 text-xs text-stone-500">
          {stats.finished} / {stats.total} finished · {stats.percent}% complete
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-300" />
    </div>
  )
}