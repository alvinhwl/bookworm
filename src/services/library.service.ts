import type { Book, BookFormat, ReadingStatus, SortOption } from '@/types'
import { matchesSearch, matchesTags } from '@/utils/search'
import { sortBooks } from '@/utils/sort'

export interface LibraryQuery {
  search?: string
  status?: ReadingStatus | null
  format?: BookFormat | null
  tags?: string[]
  standaloneOnly?: boolean
  sort?: SortOption
}

export const libraryService = {
  query(books: Book[], query: LibraryQuery): Book[] {
    let result = [...books]

    if (query.status) {
      result = result.filter((b) => b.status === query.status)
    }

    if (query.format) {
      result = result.filter((b) => b.format === query.format)
    }

    if (query.search) {
      result = result.filter((b) => matchesSearch(b, query.search!))
    }

    if (query.tags && query.tags.length > 0) {
      result = result.filter((b) => matchesTags(b, query.tags!))
    }

    if (query.standaloneOnly) {
      result = result.filter((b) => !b.collection_id)
    }

    if (query.sort) {
      result = sortBooks(result, query.sort)
    }

    return result
  },

  getStats(books: Book[]) {
    const byStatus: Record<ReadingStatus, number> = {
      want_to_read: 0,
      currently_reading: 0,
      finished: 0,
      dnf: 0,
    }

    for (const book of books) {
      byStatus[book.status]++
    }

    return {
      total: books.length,
      currentlyReading: byStatus.currently_reading,
      byStatus,
    }
  },
}