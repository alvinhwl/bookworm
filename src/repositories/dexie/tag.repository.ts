import type { Tag } from '@/types'
import { db } from '@/db'
import { generateId } from '@/utils/id'
import { normalizeTagName } from '@/utils/tag-suggestion'
import type { TagRepository } from '../types'

export const dexieTagRepository: TagRepository = {
  async getAll(): Promise<Tag[]> {
    return db.tags.toArray()
  },

  async getByBookId(bookId: string): Promise<Tag[]> {
    const links = await db.book_tags.where('book_id').equals(bookId).toArray()
    const tags = await Promise.all(links.map((l) => db.tags.get(l.tag_id)))
    return tags.filter((t): t is Tag => t != null)
  },

  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    const normalized = [...new Set(names.map(normalizeTagName).filter(Boolean))]
    const result: Tag[] = []

    for (const name of normalized) {
      let tag = await db.tags.where('name').equals(name).first()
      if (!tag) {
        tag = { id: generateId(), name }
        await db.tags.add(tag)
      }
      result.push(tag)
    }

    return result
  },

  async setBookTags(bookId: string, tagNames: string[]): Promise<Tag[]> {
    await db.book_tags.where('book_id').equals(bookId).delete()
    const tags = await this.findOrCreateByNames(tagNames.slice(0, 10))
    await db.book_tags.bulkAdd(tags.map((t) => ({ book_id: bookId, tag_id: t.id })))
    return tags
  },

  async clearBookTags(bookId: string): Promise<void> {
    await db.book_tags.where('book_id').equals(bookId).delete()
    await this.deleteOrphanTags()
  },

  async deleteOrphanTags(): Promise<void> {
    const allTags = await db.tags.toArray()
    for (const tag of allTags) {
      const count = await db.book_tags.where('tag_id').equals(tag.id).count()
      if (count === 0) await db.tags.delete(tag.id)
    }
  },
}