import type { Collection } from '@/types'
import { db } from '@/db'
import type { CollectionRepository } from '../types'

export const dexieCollectionRepository: CollectionRepository = {
  async getAll(): Promise<Collection[]> {
    return db.collections.orderBy('created_at').reverse().toArray()
  },

  async getById(id: string): Promise<Collection | undefined> {
    return db.collections.get(id)
  },

  async create(collection: Collection): Promise<string> {
    return db.collections.add(collection)
  },

  async update(id: string, changes: Partial<Collection>): Promise<void> {
    await db.collections.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.collections.delete(id)
  },

  async clear(): Promise<void> {
    await db.collections.clear()
  },
}