import type { Book } from '@/types'
import { FORMAT_LABELS } from '@/utils/status'
import { formatLogDate } from '@/utils/dates'

interface BookMetaProps {
  book: Book
}

export function BookMeta({ book }: BookMetaProps) {
  const items = [
    { label: 'Format', value: FORMAT_LABELS[book.format] },
    book.isbn ? { label: 'ISBN', value: book.isbn } : null,
    book.published_year
      ? { label: 'Published', value: String(book.published_year) }
      : null,
    book.format === 'audiobook' && book.total_duration_minutes
      ? { label: 'Duration', value: `${book.total_duration_minutes} min` }
      : book.total_pages
        ? { label: 'Pages', value: String(book.total_pages) }
        : null,
    { label: 'Added', value: formatLogDate(book.created_at) },
    book.started_at ? { label: 'Started', value: formatLogDate(book.started_at) } : null,
    book.finished_at
      ? { label: 'Finished', value: formatLogDate(book.finished_at) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm text-stone-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}