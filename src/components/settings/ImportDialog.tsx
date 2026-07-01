import { useState } from 'react'
import type { ExportBundle, ImportMode, ImportPreview as ImportPreviewType } from '@/types'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ImportPreview } from './ImportPreview'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  preview: ImportPreviewType | null
  bundle: ExportBundle | null
  onConfirm: (mode: ImportMode) => Promise<void>
}

export function ImportDialog({
  open,
  onClose,
  preview,
  bundle,
  onConfirm,
}: ImportDialogProps) {
  const [replaceConfirmed, setReplaceConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm(mode: ImportMode) {
    setLoading(true)
    try {
      await onConfirm(mode)
      onClose()
      setReplaceConfirmed(false)
    } finally {
      setLoading(false)
    }
  }

  if (!preview || !bundle) return null

  return (
    <Dialog open={open} onClose={onClose} title="Import library">
      <ImportPreview preview={preview} />

      {preview.isValid && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => handleConfirm('merge')}
              disabled={loading}
              className="flex-1"
            >
              Merge (recommended)
            </Button>
            <Button
              variant="danger"
              onClick={() => handleConfirm('replace')}
              disabled={loading || !replaceConfirmed}
              className="flex-1"
            >
              Replace all
            </Button>
          </div>

          <label className="flex items-start gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={replaceConfirmed}
              onChange={(e) => setReplaceConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span>
              I understand that Replace All will permanently delete my current library
              and replace it with the imported data.
            </span>
          </label>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Dialog>
  )
}