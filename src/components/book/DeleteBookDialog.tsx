import { ConfirmDialog } from '@/components/ui/Dialog'

interface DeleteBookDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteBookDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: DeleteBookDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete book"
      message="Are you sure? This will permanently remove the book and its reading history."
      confirmLabel="Delete"
      variant="danger"
      loading={loading}
    />
  )
}