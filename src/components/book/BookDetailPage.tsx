import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import type { ReadingStatus } from '@/types'
import { useBook } from '@/hooks/useBook'
import { useReadingLog } from '@/hooks/useReadingLog'
import { bookService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { BookCover } from './BookCover'
import { BookMeta } from './BookMeta'
import { StatusBadge } from '@/components/library/StatusBadge'
import { StatusSelector } from './StatusSelector'
import { ProgressSection } from './ProgressSection'
import { ReadingLogList } from './ReadingLogList'
import { NotesSection } from './NotesSection'
import { DeleteBookDialog } from './DeleteBookDialog'
import { LastBookDeleteDialog } from './LastBookDeleteDialog'
import { Badge } from '@/components/ui/Badge'
import { getTotal, percentComplete } from '@/utils/progress'

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { book, loading, refresh } = useBook(id)
  const { entries, refresh: refreshLogs } = useReadingLog(id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [lastBookDeleteOpen, setLastBookDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ReadingStatus | null>(null)
  const [dnfDialogOpen, setDnfDialogOpen] = useState(false)
  const [dnfReason, setDnfReason] = useState('')
  const [finishedAt, setFinishedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  )

  async function handleRefresh() {
    await Promise.all([refresh(), refreshLogs()])
  }

  async function handleStatusChange(newStatus: ReadingStatus) {
    if (!book || newStatus === book.status) return

    if (newStatus === 'finished') {
      const total = getTotal(book)
      const pct = percentComplete(book)
      if (total != null && pct != null && pct < 100) {
        setPendingStatus(newStatus)
        setFinishDialogOpen(true)
        return
      }
    }

    if (newStatus === 'dnf') {
      setPendingStatus(newStatus)
      setDnfDialogOpen(true)
      return
    }

    await applyStatusChange(newStatus)
  }

  async function applyStatusChange(
    newStatus: ReadingStatus,
    options?: {
      setProgressToComplete?: boolean
      finishedAt?: string
      dnfReason?: string
    },
  ) {
    if (!book) return
    const result = await bookService.updateStatus(book.id, newStatus, options)
    if (result.warning) {
      showToast(result.warning, 'warning')
    } else {
      showToast('Status updated', 'success')
    }
    await handleRefresh()
  }

  async function handleDeleteClick() {
    if (!book) return
    if (await bookService.isLastInCollection(book.id)) {
      setLastBookDeleteOpen(true)
    } else {
      setDeleteOpen(true)
    }
  }

  async function handleDelete() {
    if (!book) return
    setDeleting(true)
    try {
      await bookService.delete(book.id)
      showToast('Book deleted', 'success')
      navigate('/')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleLastBookDelete(action: 'delete_collection' | 'unlink') {
    if (!book) return
    setDeleting(true)
    try {
      await bookService.delete(book.id, action)
      showToast(action === 'unlink' ? 'Book kept · collection removed' : 'Book deleted', 'success')
      navigate('/')
    } finally {
      setDeleting(false)
      setLastBookDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-600">Book not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          Back to library
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Library
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/books/${book.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        <BookCover book={book} size="lg" />
        <div className="flex-1">
          <StatusBadge status={book.status} />
          <h1 className="mt-2 font-serif text-2xl font-bold text-stone-900 md:text-3xl">
            {book.title}
          </h1>
          <p className="mt-1 text-lg text-stone-600">{book.author}</p>
          {(book.tags ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags!.map((tag) => (
                <Badge key={tag.id} variant="muted">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          {book.collection_id && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => navigate(`/collections/${book.collection_id}`)}
            >
              View collection
            </Button>
          )}
          <div className="mt-4 max-w-xs">
            <StatusSelector status={book.status} onChange={handleStatusChange} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-serif text-lg font-semibold text-stone-900">
            Details
          </h2>
          <BookMeta book={book} />
        </section>

        <ProgressSection book={book} onUpdate={handleRefresh} />
        <NotesSection book={book} onUpdate={handleRefresh} />
        <ReadingLogList entries={entries} book={book} />
      </div>

      <DeleteBookDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <LastBookDeleteDialog
        open={lastBookDeleteOpen}
        onClose={() => setLastBookDeleteOpen(false)}
        onDeleteAll={() => handleLastBookDelete('delete_collection')}
        onUnlink={() => handleLastBookDelete('unlink')}
        loading={deleting}
      />

      <Dialog
        open={finishDialogOpen}
        onClose={() => setFinishDialogOpen(false)}
        title="Mark as finished"
      >
        <p className="mb-4 text-stone-600">
          Your progress is not at 100%. Would you like to mark this book as fully complete?
        </p>
        <Input
          label="Finished date"
          type="date"
          value={finishedAt}
          onChange={(e) => setFinishedAt(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              if (pendingStatus) {
                await applyStatusChange(pendingStatus, { finishedAt })
              }
              setFinishDialogOpen(false)
            }}
          >
            Keep current progress
          </Button>
          <Button
            onClick={async () => {
              if (pendingStatus) {
                await applyStatusChange(pendingStatus, {
                  setProgressToComplete: true,
                  finishedAt,
                })
              }
              setFinishDialogOpen(false)
            }}
          >
            Mark 100% complete
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={dnfDialogOpen}
        onClose={() => setDnfDialogOpen(false)}
        title="Did not finish"
      >
        <p className="mb-4 text-stone-600">
          Optionally add a reason (will be appended to notes):
        </p>
        <Input
          value={dnfReason}
          onChange={(e) => setDnfReason(e.target.value)}
          placeholder="Lost interest, too long, etc."
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDnfDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (pendingStatus) {
                await applyStatusChange(pendingStatus, {
                  dnfReason: dnfReason || undefined,
                })
              }
              setDnfDialogOpen(false)
              setDnfReason('')
            }}
          >
            Confirm
          </Button>
        </div>
      </Dialog>
    </div>
  )
}