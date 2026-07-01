import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import type { CollectionStats, ReadingStatus } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useFilteredBooks } from '@/hooks/useFilteredBooks'
import { useLibraryFilters } from '@/hooks/useLibraryFilters'
import { useCollections } from '@/hooks/useCollections'
import { bookService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { LibraryToolbar } from './LibraryToolbar'
import { LibraryViewToggle } from './LibraryViewToggle'
import { BookList } from './BookList'
import { EmptyLibrary } from './EmptyLibrary'
import { CollectionListItem } from '@/components/collections/CollectionListItem'

export function LibraryPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { books, allBooks, stats, loading, refresh } = useFilteredBooks()
  const { collections, loading: collectionsLoading, refresh: refreshCollections } =
    useCollections()
  const {
    search,
    status,
    format,
    view,
    tags,
    hasActiveFilters,
    setSearch,
    setStatus,
    setFormat,
    setView,
    toggleTag,
    clearAll,
  } = useLibraryFilters()

  const allTags = useMemo(() => {
    const names = new Set<string>()
    for (const book of allBooks) {
      for (const tag of book.tags ?? []) names.add(tag.name)
    }
    return [...names].sort()
  }, [allBooks])

  const collectionStatsMap = useMemo(() => {
    const map = new Map<string, CollectionStats>()
    for (const collection of collections) {
      const volumes = allBooks.filter((b) => b.collection_id === collection.id)
      const finished = volumes.filter((b) => b.status === 'finished').length
      const total = volumes.length
      map.set(collection.id, {
        total,
        finished,
        percent: total > 0 ? Math.round((finished / total) * 100) : 0,
      })
    }
    return map
  }, [collections, allBooks])

  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return collections
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        allBooks.some(
          (b) =>
            b.collection_id === c.id &&
            (b.title.toLowerCase().includes(q) ||
              (b.tags ?? []).some((t) => t.name.includes(q))),
        ),
    )
  }, [collections, search, allBooks])

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  )

  const subtitle = `${stats.total} book${stats.total !== 1 ? 's' : ''}${
    collections.length > 0 ? ` · ${collections.length} collection${collections.length !== 1 ? 's' : ''}` : ''
  }${
    stats.currentlyReading > 0
      ? ` · ${stats.currentlyReading} currently reading`
      : ''
  }`

  async function handleQuickStatusChange(bookId: string, newStatus: ReadingStatus) {
    const result = await bookService.updateStatus(bookId, newStatus)
    if (result.warning) showToast(result.warning, 'warning')
    await Promise.all([refresh(), refreshCollections()])
  }

  if (loading || collectionsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (allBooks.length === 0 && collections.length === 0) {
    return (
      <>
        <PageHeader title="My Library" subtitle="0 books" />
        <EmptyLibrary />
      </>
    )
  }

  const showBooks = view === 'all' || view === 'books'
  const showCollections = view === 'all' || view === 'collections'
  const noResults =
    (view === 'books' && books.length === 0) ||
    (view === 'collections' && filteredCollections.length === 0) ||
    (view === 'all' && books.length === 0 && filteredCollections.length === 0)

  return (
    <>
      <PageHeader
        title="My Library"
        subtitle={subtitle}
        actions={
          <Button onClick={() => navigate('/add')} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <div className="mb-4">
        <LibraryViewToggle view={view} onChange={setView} />
      </div>

      <LibraryToolbar
        search={search}
        status={status}
        format={format}
        tags={tags}
        allTags={allTags}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onFormatChange={setFormat}
        onToggleTag={toggleTag}
        onClearAll={clearAll}
      />

      {noResults ? (
        <div className="flex flex-col items-center py-16 text-center">
          <SearchX className="mb-4 h-12 w-12 text-stone-300" />
          <h2 className="text-lg font-medium text-stone-700">No results found</h2>
          <p className="mt-1 text-sm text-stone-500">
            Try clearing your filters or add something new.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-4" onClick={clearAll}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {showCollections && filteredCollections.length > 0 && (
            <section className="space-y-3">
              {view === 'all' && (
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Collections
                </h2>
              )}
              {filteredCollections.map((collection) => (
                <CollectionListItem
                  key={collection.id}
                  collection={collection}
                  stats={
                    collectionStatsMap.get(collection.id) ?? {
                      total: 0,
                      finished: 0,
                      percent: 0,
                    }
                  }
                  onSelect={(cid) => navigate(`/collections/${cid}`)}
                />
              ))}
            </section>
          )}

          {showBooks && books.length > 0 && (
            <section className="space-y-3">
              {view === 'all' && (
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Books
                </h2>
              )}
              <BookList
                books={books}
                collectionMap={collectionMap}
                onSelect={(id) => navigate(`/books/${id}`)}
                onQuickStatusChange={handleQuickStatusChange}
              />
            </section>
          )}
        </div>
      )}
    </>
  )
}