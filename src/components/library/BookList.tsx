import type { Book, Collection, ReadingStatus } from '@/types'
import { BookListItem } from './BookListItem'

interface BookListProps {
  books: Book[]
  collectionMap?: Map<string, Collection>
  onSelect: (id: string) => void
  onQuickStatusChange: (id: string, status: ReadingStatus) => void
}

export function BookList({
  books,
  collectionMap,
  onSelect,
  onQuickStatusChange,
}: BookListProps) {
  return (
    <div className="flex flex-col gap-3">
      {books.map((book) => (
        <BookListItem
          key={book.id}
          book={book}
          collection={book.collection_id ? collectionMap?.get(book.collection_id) : undefined}
          onSelect={onSelect}
          onQuickStatusChange={onQuickStatusChange}
        />
      ))}
    </div>
  )
}