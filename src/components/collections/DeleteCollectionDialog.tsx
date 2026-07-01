import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface DeleteCollectionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (mode: 'keep_books' | 'delete_all') => void
  collectionName: string
  loading?: boolean
}

export function DeleteCollectionDialog({
  open,
  onClose,
  onConfirm,
  collectionName,
  loading,
}: DeleteCollectionDialogProps) {
  const [mode, setMode] = useState<'keep_books' | 'delete_all'>('keep_books')
  const [confirmed, setConfirmed] = useState(false)

  function handleClose() {
    setMode('keep_books')
    setConfirmed(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Delete collection">
      <p className="mb-4 text-sm text-stone-600">
        What should happen to the books in <strong>{collectionName}</strong>?
      </p>

      <div className="space-y-3">
        <label className="flex cursor-pointer gap-3 rounded-lg border border-stone-200 p-3">
          <input
            type="radio"
            name="delete-mode"
            checked={mode === 'keep_books'}
            onChange={() => setMode('keep_books')}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-stone-900">Delete collection only — keep books</p>
            <p className="text-sm text-stone-500">
              Books become standalone; reading history is preserved.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer gap-3 rounded-lg border border-red-200 p-3">
          <input
            type="radio"
            name="delete-mode"
            checked={mode === 'delete_all'}
            onChange={() => setMode('delete_all')}
            className="mt-1"
          />
          <div>
            <p className="font-medium text-red-800">Delete collection and all books</p>
            <p className="text-sm text-stone-500">
              Permanently removes every volume and its reading log.
            </p>
          </div>
        </label>
      </div>

      {mode === 'delete_all' && (
        <label className="mt-4 flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I understand this cannot be undone
        </label>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={mode === 'delete_all' ? 'danger' : 'primary'}
          disabled={loading || (mode === 'delete_all' && !confirmed)}
          onClick={() => onConfirm(mode)}
        >
          {loading ? 'Deleting…' : 'Delete collection'}
        </Button>
      </div>
    </Dialog>
  )
}