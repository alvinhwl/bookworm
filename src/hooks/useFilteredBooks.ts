import { useMemo } from 'react'
import { useBooks } from './useBooks'
import { useLibraryFilters } from './useLibraryFilters'
import { useDebouncedValue } from './useDebouncedValue'
import { useSettings } from './useSettings'
import { libraryService } from '@/services'

export function useFilteredBooks() {
  const { books, loading, error, refresh } = useBooks()
  const { search, status, format, tags, view } = useLibraryFilters()
  const { settings } = useSettings()
  const debouncedSearch = useDebouncedValue(search, 250)

  const filteredBooks = useMemo(() => {
    return libraryService.query(books, {
      search: debouncedSearch,
      status,
      format,
      tags,
      standaloneOnly: view === 'books',
      sort: settings?.default_sort,
    })
  }, [books, debouncedSearch, status, format, tags, view, settings?.default_sort])

  const stats = useMemo(() => libraryService.getStats(books), [books])

  return {
    books: filteredBooks,
    allBooks: books,
    stats,
    loading,
    error,
    refresh,
  }
}