import type { Book, ReadingStatus } from '@/types'
import { db } from '@/db'

export const bookRepository = {
  async getAll(): Promise<Book[]> {
    return db.books.toArray()
  },

  async getById(id: string): Promise<Book | undefined> {
    return db.books.get(id)
  },

  async create(book: Book): Promise<string> {
    return db.books.add(book)
  },

  async update(id: string, changes: Partial<Book>): Promise<void> {
    await db.books.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.books.delete(id)
  },

  async countByStatus(status: ReadingStatus): Promise<number> {
    return db.books.where('status').equals(status).count()
  },

  async getCurrentlyReading(): Promise<Book[]> {
    return db.books.where('status').equals('currently_reading').toArray()
  },

  async bulkPut(books: Book[]): Promise<void> {
    await db.books.bulkPut(books)
  },

  async clear(): Promise<void> {
    await db.books.clear()
  },
}