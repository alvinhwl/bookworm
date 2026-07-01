import { useEffect, useState } from 'react'
import type { Book, BookFormat, CreateBookInput, ReadingStatus } from '@/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { tagService } from '@/services'
import { TagInput } from '@/components/tags/TagInput'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { CoverInput } from './CoverInput'
import { READING_STATUS_LABELS, FORMAT_LABELS } from '@/utils/status'
import { validateBookForm } from '@/utils/validation'

const formatOptions = (Object.entries(FORMAT_LABELS) as [BookFormat, string][]).map(
  ([value, label]) => ({ value, label }),
)

const statusOptions = (
  Object.entries(READING_STATUS_LABELS) as [ReadingStatus, string][]
).map(([value, label]) => ({ value, label }))

interface BookFormProps {
  initialValues?: Partial<Book>
  onSubmit: (data: CreateBookInput, tagNames: string[]) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

export function BookForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: BookFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [author, setAuthor] = useState(initialValues?.author ?? '')
  const [format, setFormat] = useState<BookFormat>(
    initialValues?.format ?? 'physical',
  )
  const [status, setStatus] = useState<ReadingStatus>(
    initialValues?.status ?? 'want_to_read',
  )
  const [coverUrl, setCoverUrl] = useState<string | null>(
    initialValues?.cover_url ?? null,
  )
  const [isbn, setIsbn] = useState(initialValues?.isbn ?? '')
  const [publishedYear, setPublishedYear] = useState(
    initialValues?.published_year?.toString() ?? '',
  )
  const [totalPages, setTotalPages] = useState(
    initialValues?.total_pages?.toString() ?? '',
  )
  const [totalDuration, setTotalDuration] = useState(
    initialValues?.total_duration_minutes?.toString() ?? '',
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [tags, setTags] = useState<string[]>(
    initialValues?.tags?.map((t) => t.name) ?? [],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const isEdit = Boolean(initialValues?.id)
  const debouncedTitle = useDebouncedValue(title, 500)
  const debouncedAuthor = useDebouncedValue(author, 500)

  const isValid = title.trim() && author.trim()

  useEffect(() => {
    if (isEdit || tags.length > 0) return
    if (!debouncedTitle.trim() || !debouncedAuthor.trim()) return
    setTags(tagService.suggest({ title: debouncedTitle, author: debouncedAuthor, notes, format }))
  }, [debouncedTitle, debouncedAuthor, notes, format, isEdit, tags.length])

  function validate(): boolean {
    const result = validateBookForm({ title, author })
    setErrors(result.errors)
    return result.valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(
        {
          title: title.trim(),
          author: author.trim(),
          format,
          status,
          cover_url: coverUrl,
          isbn: isbn.trim() || null,
          published_year: publishedYear ? Number(publishedYear) : null,
          total_pages:
            format !== 'audiobook' && totalPages ? Number(totalPages) : null,
          total_duration_minutes:
            format === 'audiobook' && totalDuration
              ? Number(totalDuration)
              : null,
          notes,
          started_at: initialValues?.started_at ?? null,
          finished_at: initialValues?.finished_at ?? null,
        },
        tags,
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          setTouched((t) => ({ ...t, title: true }))
          validate()
        }}
        error={touched.title ? errors.title : undefined}
        required
      />

      <Input
        label="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        onBlur={() => {
          setTouched((t) => ({ ...t, author: true }))
          validate()
        }}
        error={touched.author ? errors.author : undefined}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Format"
          options={formatOptions}
          value={format}
          onChange={(e) => setFormat(e.target.value as BookFormat)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as ReadingStatus)}
        />
      </div>

      <CoverInput value={coverUrl} onChange={setCoverUrl} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Publication year"
          type="number"
          value={publishedYear}
          onChange={(e) => setPublishedYear(e.target.value)}
          placeholder="Optional"
        />
      </div>

      {format === 'audiobook' ? (
        <Input
          label="Total duration (minutes)"
          type="number"
          min={1}
          value={totalDuration}
          onChange={(e) => setTotalDuration(e.target.value)}
          placeholder="Optional"
        />
      ) : (
        <Input
          label="Total pages"
          type="number"
          min={1}
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
          placeholder="Optional"
        />
      )}

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes about this book"
      />

      <TagInput
        tags={tags}
        onChange={setTags}
        onSuggest={
          isEdit
            ? () => setTags(tagService.suggest({ title, author, notes, format }))
            : undefined
        }
      />

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}