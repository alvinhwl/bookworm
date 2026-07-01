import type { Tag } from '@/types'
import { tagRepository } from '@/repositories'
import { suggestTags, normalizeTagName, type SuggestTagsInput } from '@/utils/tag-suggestion'

async function withTagFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.warn('[bookworm] Tags unavailable — books still work without them.', error)
    return fallback
  }
}

export const tagService = {
  normalize: normalizeTagName,

  suggest(input: SuggestTagsInput): string[] {
    return suggestTags(input)
  },

  async getAll(): Promise<Tag[]> {
    return withTagFallback(() => tagRepository.getAll(), [])
  },

  async getForBook(bookId: string): Promise<Tag[]> {
    return withTagFallback(() => tagRepository.getByBookId(bookId), [])
  },

  async setBookTags(bookId: string, tagNames: string[]): Promise<Tag[]> {
    const normalized = [...new Set(tagNames.map(normalizeTagName).filter(Boolean))]
    return withTagFallback(() => tagRepository.setBookTags(bookId, normalized), [])
  },

  async attachTagsToBooks(
    books: { id: string }[],
  ): Promise<Map<string, Tag[]>> {
    return withTagFallback(async () => {
      const map = new Map<string, Tag[]>()
      await Promise.all(
        books.map(async (book) => {
          const tags = await tagRepository.getByBookId(book.id)
          map.set(book.id, tags)
        }),
      )
      return map
    }, new Map())
  },
}