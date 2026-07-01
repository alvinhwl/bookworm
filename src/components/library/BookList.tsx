import type { Book, ReadingStatus } from '@/types'
import { BookListItem } from './BookListItem'

interface BookListProps {
  books: Book[]
  onSelect: (id: string) => void
  onQuickStatusChange: (id: string, status: ReadingStatus) => void
}

export function BookList({ books, onSelect, onQuickStatusChange }: BookListProps) {
  return (
    <div className="flex flex-col gap-3">
      {books.map((book) => (
        <BookListItem
          key={book.id}
          book={book}
          onSelect={onSelect}
          onQuickStatusChange={onQuickStatusChange}
        />
      ))}
    </div>
  )
}