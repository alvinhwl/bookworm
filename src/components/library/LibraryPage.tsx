import { useNavigate } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import type { ReadingStatus } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useFilteredBooks } from '@/hooks/useFilteredBooks'
import { useLibraryFilters } from '@/hooks/useLibraryFilters'
import { bookService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { LibraryToolbar } from './LibraryToolbar'
import { BookList } from './BookList'
import { EmptyLibrary } from './EmptyLibrary'

export function LibraryPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { books, allBooks, stats, loading, refresh } = useFilteredBooks()
  const {
    search,
    status,
    format,
    hasActiveFilters,
    setSearch,
    setStatus,
    setFormat,
    clearAll,
  } = useLibraryFilters()

  const subtitle = `${stats.total} book${stats.total !== 1 ? 's' : ''}${
    stats.currentlyReading > 0
      ? ` · ${stats.currentlyReading} currently reading`
      : ''
  }`

  async function handleQuickStatusChange(bookId: string, newStatus: ReadingStatus) {
    const result = await bookService.updateStatus(bookId, newStatus)
    if (result.warning) {
      showToast(result.warning, 'warning')
    }
    await refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (allBooks.length === 0) {
    return (
      <>
        <PageHeader title="My Library" subtitle="0 books" />
        <EmptyLibrary />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="My Library"
        subtitle={subtitle}
        actions={
          <Button onClick={() => navigate('/books/new')} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        }
      />

      <LibraryToolbar
        search={search}
        status={status}
        format={format}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onFormatChange={setFormat}
        onClearAll={clearAll}
      />

      {books.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <SearchX className="mb-4 h-12 w-12 text-stone-300" />
          <h2 className="text-lg font-medium text-stone-700">No results found</h2>
          <p className="mt-1 text-sm text-stone-500">
            Try clearing your filters or add a new book.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-4" onClick={clearAll}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <BookList
          books={books}
          onSelect={(id) => navigate(`/books/${id}`)}
          onQuickStatusChange={handleQuickStatusChange}
        />
      )}
    </>
  )
}