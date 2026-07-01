import type { Book } from '@/types'

export function matchesSearch(book: Book, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    book.notes.toLowerCase().includes(q)
  )
}