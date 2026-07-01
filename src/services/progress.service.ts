import type { Book, ReadingLogEntry } from '@/types'
import { bookRepository, readingLogRepository } from '@/repositories'
import { db } from '@/db'
import { isSupabaseEnabled } from '@/lib/supabase'
import { generateId } from '@/utils/id'
import { nowISO } from '@/utils/dates'
import { validateProgress } from '@/utils/progress'
import { BookwormError } from './errors'

export const progressService = {
  validateProgress(book: Book, value: number) {
    return validateProgress(book, value)
  },

  async updateProgress(
    bookId: string,
    value: number,
    note?: string | null,
  ): Promise<{ book: Book; entry: ReadingLogEntry }> {
    const book = await bookRepository.getById(bookId)
    if (!book) {
      throw new BookwormError('NOT_FOUND', 'Book not found')
    }

    const validation = validateProgress(book, value)
    if (!validation.valid) {
      throw new BookwormError('VALIDATION', validation.error ?? 'Invalid progress')
    }

    const entry: ReadingLogEntry = {
      id: generateId(),
      book_id: bookId,
      value,
      note: note ?? null,
      logged_at: nowISO(),
    }

    const updatedBook: Book = {
      ...book,
      current_progress: value,
      updated_at: nowISO(),
    }

    if (isSupabaseEnabled()) {
      await bookRepository.update(bookId, {
        current_progress: updatedBook.current_progress,
        updated_at: updatedBook.updated_at,
      })
      await readingLogRepository.create(entry)
    } else {
      await db.transaction('rw', db.books, db.readingLog, async () => {
        await bookRepository.update(bookId, updatedBook)
        await readingLogRepository.create(entry)
      })
    }

    return { book: updatedBook, entry }
  },

  async getRecentLogs(bookId: string, limit = 5): Promise<ReadingLogEntry[]> {
    return readingLogRepository.getByBookId(bookId, limit)
  },
}