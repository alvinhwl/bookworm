import { useRef, useState } from 'react'
import type { ExportBundle, ImportPreview as ImportPreviewType } from '@/types'
import { Button } from '@/components/ui/Button'
import { importExportService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { ImportDialog } from './ImportDialog'
import { Download, Upload } from 'lucide-react'

interface DataSectionProps {
  onImportComplete: () => void
}

export function DataSection({ onImportComplete }: DataSectionProps) {
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [bundle, setBundle] = useState<ExportBundle | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await importExportService.downloadExport()
      showToast('Library exported successfully', 'success')
    } catch {
      showToast('Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const parsed = await importExportService.parseImportFile(file)
      const previewResult = await importExportService.previewImport(parsed)
      setBundle(parsed)
      setPreview(previewResult)
      setImportOpen(true)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Invalid import file',
        'error',
      )
    }
    e.target.value = ''
  }

  async function handleImportConfirm(mode: 'merge' | 'replace') {
    if (!bundle) return
    const result = await importExportService.executeImport(bundle, mode)
    showToast(
      `Import complete: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped`,
      'success',
    )
    onImportComplete()
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
        Data
      </h2>
      <p className="mb-4 text-sm text-stone-500">
        Export your library as JSON for backup or transfer between devices.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export library'}
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import library
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        preview={preview}
        bundle={bundle}
        onConfirm={handleImportConfirm}
      />
    </section>
  )
}