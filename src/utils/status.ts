import type { Book, ReadingStatus } from '@/types'
import { todayISO } from './dates'

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: 'Want to Read',
  currently_reading: 'Currently Reading',
  finished: 'Finished',
  dnf: 'Did Not Finish',
}

export const FORMAT_LABELS = {
  physical: 'Physical',
  ebook: 'Ebook',
  audiobook: 'Audiobook',
} as const

export function applyStatusTransition(
  book: Book,
  newStatus: ReadingStatus,
  options?: { finishedAt?: string; dnfReason?: string },
): Partial<Book> {
  const changes: Partial<Book> = { status: newStatus }

  if (newStatus === 'currently_reading' && !book.started_at) {
    changes.started_at = todayISO()
  }

  if (newStatus === 'finished') {
    changes.finished_at = options?.finishedAt ?? book.finished_at ?? todayISO()
  }

  if (newStatus === 'dnf' && options?.dnfReason) {
    const prefix = book.notes ? `${book.notes}\n\n` : ''
    changes.notes = `${prefix}DNF: ${options.dnfReason}`
  }

  return changes
}