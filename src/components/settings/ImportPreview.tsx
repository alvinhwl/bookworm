import type { ImportPreview as ImportPreviewType } from '@/types'

interface ImportPreviewProps {
  preview: ImportPreviewType
}

export function ImportPreview({ preview }: ImportPreviewProps) {
  if (!preview.isValid) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <p className="font-medium">Invalid import file</p>
        <ul className="mt-2 list-inside list-disc">
          {preview.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-sm text-stone-700">
      <p className="font-medium text-stone-900">Import preview</p>
      <ul className="space-y-1">
        <li>
          <span className="font-medium text-emerald-700">{preview.toAdd.length}</span>{' '}
          book{preview.toAdd.length !== 1 ? 's' : ''} to add
        </li>
        <li>
          <span className="font-medium text-amber-700">{preview.toUpdate.length}</span>{' '}
          book{preview.toUpdate.length !== 1 ? 's' : ''} to update
        </li>
        <li>
          <span className="font-medium text-stone-500">{preview.unchanged}</span>{' '}
          unchanged
        </li>
        <li>
          <span className="font-medium text-sky-700">
            {preview.logEntriesToAdd.length + preview.logEntriesToUpdate.length}
          </span>{' '}
          reading log entries
        </li>
      </ul>
    </div>
  )
}