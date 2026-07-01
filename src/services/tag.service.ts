import type { Tag } from '@/types'
import { tagRepository } from '@/repositories'
import { suggestTags, normalizeTagName, type SuggestTagsInput } from '@/utils/tag-suggestion'

export const tagService = {
  normalize: normalizeTagName,

  suggest(input: SuggestTagsInput): string[] {
    return suggestTags(input)
  },

  async getAll(): Promise<Tag[]> {
    return tagRepository.getAll()
  },

  async getForBook(bookId: string): Promise<Tag[]> {
    return tagRepository.getByBookId(bookId)
  },

  async setBookTags(bookId: string, tagNames: string[]): Promise<Tag[]> {
    const normalized = [...new Set(tagNames.map(normalizeTagName).filter(Boolean))]
    return tagRepository.setBookTags(bookId, normalized)
  },

  async attachTagsToBooks(
    books: { id: string }[],
  ): Promise<Map<string, Tag[]>> {
    const map = new Map<string, Tag[]>()
    await Promise.all(
      books.map(async (book) => {
        const tags = await tagRepository.getByBookId(book.id)
        map.set(book.id, tags)
      }),
    )
    return map
  },
}