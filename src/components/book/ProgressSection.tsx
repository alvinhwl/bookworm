import { useState } from 'react'
import type { Book } from '@/types'
import { ProgressBar } from './ProgressBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { percentComplete } from '@/utils/progress'
import { formatDateTime } from '@/utils/dates'
import { progressService } from '@/services'

interface ProgressSectionProps {
  book: Book
  onUpdate: () => void
}

export function ProgressSection({ book, onUpdate }: ProgressSectionProps) {
  const [value, setValue] = useState(String(book.current_progress))
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const pct = percentComplete(book)
  const unitLabel = book.format === 'audiobook' ? 'Minutes listened' : 'Current page'

  async function handleSave() {
    const num = Number(value)
    if (isNaN(num)) {
      setError('Please enter a valid number')
      return
    }

    const validation = progressService.validateProgress(book, num)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid progress')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await progressService.updateProgress(book.id, num, note || null)
      setNote('')
      onUpdate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update progress')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-4 font-serif text-lg font-semibold text-stone-900">
        Reading Progress
      </h2>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-stone-600">
            {pct != null ? `${pct}% complete` : 'Progress'}
          </span>
          <span className="text-stone-500">
            Updated {formatDateTime(book.updated_at)}
          </span>
        </div>
        <ProgressBar percent={pct} />
      </div>

      <div className="space-y-3">
        <Input
          label={unitLabel}
          type="number"
          min={0}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          error={error ?? undefined}
        />
        <Input
          label="Session note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Chapter 12, Halfway!"
        />
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Update progress'}
        </Button>
      </div>
    </section>
  )
}