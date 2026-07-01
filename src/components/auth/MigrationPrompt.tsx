import { useEffect, useState } from 'react'
import { migrationService, type MigrationResult } from '@/services/migration.service'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useBooks } from '@/hooks/useBooks'

export function MigrationPrompt() {
  const { enabled, user } = useAuth()
  const { refresh } = useBooks()
  const [open, setOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !user) return
    migrationService.shouldOfferMigration().then(setOpen)
  }, [enabled, user])

  async function handleMigrate() {
    setMigrating(true)
    setError(null)
    try {
      const res = await migrationService.migrate()
      setResult(res)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  function handleSkip() {
    migrationService.dismiss()
    setOpen(false)
  }

  function handleClose() {
    setOpen(false)
  }

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={result ? handleClose : handleSkip}
      title={result ? 'Migration complete' : 'Import your local library?'}
    >
      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Your local library has been copied to the cloud.
          </p>
          <ul className="text-sm text-stone-700">
            <li>{result.booksAdded} books added</li>
            {result.booksSkipped > 0 && (
              <li>{result.booksSkipped} books skipped (already in cloud)</li>
            )}
            <li>{result.logsAdded} reading log entries added</li>
          </ul>
          <Button onClick={handleClose} className="w-full">
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            We found books saved in this browser from Bookworm v1. Would you like
            to import them into your cloud library?
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col gap-2">
            <Button onClick={handleMigrate} disabled={migrating} className="w-full">
              {migrating ? 'Importing…' : 'Import now'}
            </Button>
            <Button variant="secondary" onClick={handleSkip} className="w-full">
              Skip for now
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}