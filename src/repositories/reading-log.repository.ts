import type { ReadingLogEntry } from '@/types'
import { db } from '@/db'

export const readingLogRepository = {
  async getByBookId(bookId: string, limit?: number): Promise<ReadingLogEntry[]> {
    const entries = await db.readingLog.where('book_id').equals(bookId).toArray()
    entries.sort((a, b) => b.logged_at.localeCompare(a.logged_at))
    if (limit != null) {
      return entries.slice(0, limit)
    }
    return entries
  },

  async create(entry: ReadingLogEntry): Promise<string> {
    return db.readingLog.add(entry)
  },

  async deleteByBookId(bookId: string): Promise<void> {
    await db.readingLog.where('book_id').equals(bookId).delete()
  },

  async bulkPut(entries: ReadingLogEntry[]): Promise<void> {
    await db.readingLog.bulkPut(entries)
  },

  async getAll(): Promise<ReadingLogEntry[]> {
    return db.readingLog.toArray()
  },

  async clear(): Promise<void> {
    await db.readingLog.clear()
  },
}