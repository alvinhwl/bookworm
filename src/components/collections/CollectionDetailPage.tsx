import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { collectionService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { BookCover } from '@/components/book/BookCover'
import { StatusBadge } from '@/components/library/StatusBadge'
import { formatBookTitle } from '@/utils/book-display'
import { DeleteCollectionDialog } from './DeleteCollectionDialog'
import { percentComplete } from '@/utils/progress'

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { collection, volumes, stats, loading } = useCollection(id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(mode: 'keep_books' | 'delete_all') {
    if (!id) return
    setDeleting(true)
    try {
      await collectionService.delete(id, mode)
      showToast('Collection deleted', 'success')
      navigate('/')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!collection || !stats) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-600">Collection not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          Back to library
        </Button>
      </div>
    )
  }

  const coverBook = {
    ...volumes[0],
    title: collection.name,
    author: collection.author,
    cover_url: collection.cover_url ?? volumes[0]?.cover_url ?? null,
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Library
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete collection
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        <BookCover book={coverBook} size="lg" />
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">{collection.name}</h1>
          <p className="mt-1 text-lg text-stone-600">{collection.author}</p>
          {collection.description && (
            <p className="mt-3 text-sm text-stone-600">{collection.description}</p>
          )}
          <p className="mt-4 text-sm text-stone-700">
            <strong>{stats.finished}</strong> of <strong>{stats.total}</strong> volumes finished
            ({stats.percent}%)
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Volumes</h2>
        {volumes.map((book) => {
          const pct = percentComplete(book)
          return (
            <div
              key={book.id}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 hover:shadow-sm"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <BookCover book={book} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-stone-900">
                  {formatBookTitle(book, collection)}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={book.status} />
                  {pct != null && <span className="text-xs text-stone-500">{pct}%</span>}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <DeleteCollectionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        collectionName={collection.name}
        loading={deleting}
      />
    </div>
  )
}