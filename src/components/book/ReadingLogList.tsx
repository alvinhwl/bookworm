import type { Book, ReadingLogEntry } from '@/types'
import { progressLabel } from '@/utils/progress'
import { formatLogDate } from '@/utils/dates'
import { History } from 'lucide-react'

interface ReadingLogListProps {
  entries: ReadingLogEntry[]
  book: Book
}

export function ReadingLogList({ entries, book }: ReadingLogListProps) {
  if (entries.length === 0) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
          Reading Log
        </h2>
        <p className="text-sm text-stone-500">No progress updates yet.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-stone-900">
        <History className="h-5 w-5 text-amber-700" />
        Reading Log
      </h2>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">
                {progressLabel(book, entry.value)}
              </p>
              {entry.note && (
                <p className="mt-0.5 text-sm text-stone-500">{entry.note}</p>
              )}
            </div>
            <time className="text-xs text-stone-400">
              {formatLogDate(entry.logged_at)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}