import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface LastBookDeleteDialogProps {
  open: boolean
  onClose: () => void
  onDeleteAll: () => void
  onUnlink: () => void
  loading?: boolean
}

export function LastBookDeleteDialog({
  open,
  onClose,
  onDeleteAll,
  onUnlink,
  loading,
}: LastBookDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Last book in collection">
      <p className="mb-4 text-sm text-stone-600">
        This is the only book in the collection. What would you like to do?
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={onUnlink} disabled={loading}>
          Keep book as standalone · delete collection
        </Button>
        <Button variant="danger" onClick={onDeleteAll} disabled={loading}>
          Delete book and collection
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Dialog>
  )
}