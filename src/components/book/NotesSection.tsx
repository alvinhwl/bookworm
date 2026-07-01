import { useState } from 'react'
import type { Book } from '@/types'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { bookService } from '@/services'

interface NotesSectionProps {
  book: Book
  onUpdate: () => void
}

export function NotesSection({ book, onUpdate }: NotesSectionProps) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(book.notes)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await bookService.update(book.id, { notes })
      setEditing(false)
      onUpdate()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Notes</h2>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              Save
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNotes(book.notes)
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-stone-600">
          {book.notes || 'No notes yet.'}
        </p>
      )}
    </section>
  )
}