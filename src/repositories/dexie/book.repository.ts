import type { Book, ReadingStatus } from '@/types'
import { db } from '@/db'
import type { BookRepository } from '../types'

export const dexieBookRepository: BookRepository = {
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

  async getByCollectionId(collectionId: string): Promise<Book[]> {
    return db.books.where('collection_id').equals(collectionId).toArray()
  },

  async unlinkFromCollection(collectionId: string): Promise<void> {
    const books = await this.getByCollectionId(collectionId)
    await Promise.all(
      books.map((b) =>
        db.books.update(b.id, { collection_id: null, volume_number: null }),
      ),
    )
  },

  async deleteByCollectionId(collectionId: string): Promise<void> {
    await db.books.where('collection_id').equals(collectionId).delete()
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