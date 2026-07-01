import type { Book } from '@/types'

export function matchesSearch(book: Book, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const tagText = (book.tags ?? []).map((t) => t.name).join(' ')
  return (
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    book.notes.toLowerCase().includes(q) ||
    tagText.toLowerCase().includes(q)
  )
}

export function matchesTags(book: Book, tagNames: string[]): boolean {
  if (tagNames.length === 0) return true
  const bookTags = new Set((book.tags ?? []).map((t) => t.name))
  return tagNames.every((name) => bookTags.has(name))
}