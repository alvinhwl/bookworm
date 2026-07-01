import type { ReadingLogEntry } from '@/types'
import { generateId } from '@/utils/id'
import { nowISO } from '@/utils/dates'

export function createLogEntry(
  bookId: string,
  overrides: Partial<ReadingLogEntry> = {},
): ReadingLogEntry {
  return {
    id: generateId(),
    book_id: bookId,
    value: 50,
    note: null,
    logged_at: nowISO(),
    ...overrides,
  }
}