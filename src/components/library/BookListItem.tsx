import type { Book, Collection, ReadingStatus } from '@/types'
import { formatBookTitle, collectionSubtitle } from '@/utils/book-display'
import { BookCover } from '@/components/book/BookCover'
import { StatusBadge } from './StatusBadge'
import { QuickStatusMenu } from './QuickStatusMenu'
import { percentComplete } from '@/utils/progress'
import { ChevronRight } from 'lucide-react'

interface BookListItemProps {
  book: Book
  collection?: Collection
  onSelect: (id: string) => void
  onQuickStatusChange: (id: string, status: ReadingStatus) => void
}

export function BookListItem({
  book,
  collection,
  onSelect,
  onQuickStatusChange,
}: BookListItemProps) {
  const pct = percentComplete(book)

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onSelect(book.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(book.id)
        }
      }}
    >
      <BookCover book={book} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-stone-900">
          {formatBookTitle(book, collection)}
        </h3>
        <p className="truncate text-sm text-stone-500">
          {collectionSubtitle(book, collection) ?? book.author}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={book.status} />
          {(book.tags ?? []).slice(0, 3).map((tag) => (
            <span key={tag.id} className="text-xs text-stone-400">
              #{tag.name}
            </span>
          ))}
          {pct != null && (
            <span className="text-xs text-stone-500">{pct}% complete</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <QuickStatusMenu
          status={book.status}
          onStatusChange={(s) => onQuickStatusChange(book.id, s)}
        />
        <ChevronRight className="h-5 w-5 text-stone-300" />
      </div>
    </div>
  )
}