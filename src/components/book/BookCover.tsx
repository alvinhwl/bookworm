import type { Book } from '@/types'
import { BookOpen } from 'lucide-react'

interface BookCoverProps {
  book: Book
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-16 w-11',
  md: 'h-32 w-22',
  lg: 'h-48 w-32',
}

export function BookCover({ book, size = 'md' }: BookCoverProps) {
  const sizeClass = sizes[size]

  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={`Cover of ${book.title}`}
        className={`${sizeClass} shrink-0 rounded-md object-cover shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-100 to-stone-200 shadow-sm`}
    >
      <BookOpen className={`text-amber-700 ${size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'}`} />
    </div>
  )
}