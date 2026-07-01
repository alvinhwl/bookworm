import type {
  Book,
  CreateBookInput,
  ReadingStatus,
  UpdateBookInput,
} from '@/types'
import { bookRepository, readingLogRepository } from '@/repositories'
import { db } from '@/db'
import { generateId } from '@/utils/id'
import { nowISO } from '@/utils/dates'
import { applyStatusTransition } from '@/utils/status'
import { getTotal } from '@/utils/progress'
import { BookwormError } from './errors'

export type StatusUpdateResult = {
  book: Book
  warning?: string
}

export const bookService = {
  async getAll(): Promise<Book[]> {
    return bookRepository.getAll()
  },

  async getById(id: string): Promise<Book | null> {
    const book = await bookRepository.getById(id)
    return book ?? null
  },

  async create(input: CreateBookInput): Promise<Book> {
    const now = nowISO()
    const book: Book = {
      id: generateId(),
      current_progress: input.current_progress ?? 0,
      ...input,
      created_at: now,
      updated_at: now,
    }
    await bookRepository.create(book)
    return book
  },

  async update(id: string, input: UpdateBookInput): Promise<Book> {
    const existing = await bookRepository.getById(id)
    if (!existing) {
      throw new BookwormError('NOT_FOUND', 'Book not found')
    }
    const updated: Book = {
      ...existing,
      ...input,
      updated_at: nowISO(),
    }
    await bookRepository.update(id, updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    const existing = await bookRepository.getById(id)
    if (!existing) {
      throw new BookwormError('NOT_FOUND', 'Book not found')
    }
    await db.transaction('rw', db.books, db.readingLog, async () => {
      await readingLogRepository.deleteByBookId(id)
      await bookRepository.delete(id)
    })
  },

  async updateStatus(
    id: string,
    status: ReadingStatus,
    options?: { finishedAt?: string; dnfReason?: string; setProgressToComplete?: boolean },
  ): Promise<StatusUpdateResult> {
    const existing = await bookRepository.getById(id)
    if (!existing) {
      throw new BookwormError('NOT_FOUND', 'Book not found')
    }

    let warning: string | undefined
    if (status === 'currently_reading') {
      const others = (await bookRepository.getCurrentlyReading()).filter(
        (b) => b.id !== id,
      )
      if (others.length > 0) {
        warning = `You already have ${others.length} book(s) marked as Currently Reading.`
      }
    }

    const changes = applyStatusTransition(existing, status, options)

    if (status === 'finished' && options?.setProgressToComplete) {
      const total = getTotal(existing)
      if (total != null) {
        changes.current_progress = total
      }
    }

    const updated = await this.update(id, {
      ...changes,
      updated_at: nowISO(),
    })

    return { book: updated, warning }
  },

  async getCurrentlyReading(): Promise<Book[]> {
    return bookRepository.getCurrentlyReading()
  },

  async getFinishedInYear(year: number): Promise<Book[]> {
    const books = await bookRepository.getAll()
    return books.filter((b) => {
      if (b.status !== 'finished' || !b.finished_at) return false
      return b.finished_at.startsWith(String(year))
    })
  },
}