import type {
  Book,
  Collection,
  CollectionDeleteMode,
  CollectionStats,
  CreateCollectionInput,
  CreateVolumeInput,
} from '@/types'
import {
  bookRepository,
  collectionRepository,
  readingLogRepository,
  tagRepository,
} from '@/repositories'
import { db } from '@/db'
import { isSupabaseEnabled } from '@/lib/supabase'
import { generateId } from '@/utils/id'
import { nowISO } from '@/utils/dates'
import { authService } from './auth.service'
import { coverService } from './cover.service'
import { BookwormError } from './errors'

export const collectionService = {
  async getAll(): Promise<Collection[]> {
    try {
      return await collectionRepository.getAll()
    } catch (error) {
      console.warn('[bookworm] Collections unavailable — showing books only.', error)
      return []
    }
  },

  async getById(id: string): Promise<Collection | null> {
    const c = await collectionRepository.getById(id)
    return c ?? null
  },

  async getVolumes(collectionId: string): Promise<Book[]> {
    const books = await bookRepository.getByCollectionId(collectionId)
    return books.sort((a, b) => {
      if (a.volume_number != null && b.volume_number != null) {
        return a.volume_number - b.volume_number
      }
      return a.title.localeCompare(b.title)
    })
  },

  async getStats(collectionId: string): Promise<CollectionStats> {
    const volumes = await this.getVolumes(collectionId)
    const finished = volumes.filter((b) => b.status === 'finished').length
    const total = volumes.length
    return {
      total,
      finished,
      percent: total > 0 ? Math.round((finished / total) * 100) : 0,
    }
  },

  async create(input: CreateCollectionInput): Promise<Collection> {
    if (input.volumes.length < 1) {
      throw new BookwormError('VALIDATION', 'Add at least one book to this collection.')
    }

    const now = nowISO()
    const collectionId = generateId()
    const userId = await authService.getUserId()

    let cover_url = input.cover_url ?? null
    if (userId && cover_url?.startsWith('data:image/')) {
      cover_url = await coverService.resolveCoverUrl(cover_url, userId, collectionId)
    }

    const collection: Collection = {
      id: collectionId,
      name: input.name.trim(),
      author: input.author.trim(),
      description: input.description?.trim() ?? '',
      cover_url,
      volume_mode: input.volume_mode,
      expected_volume_count: input.expected_volume_count ?? null,
      created_at: now,
      updated_at: now,
    }

    const books = input.volumes.map((vol, index) =>
      buildVolumeBook(collection, vol, index, now),
    )

    await runCollectionTransaction(async () => {
      await collectionRepository.create(collection)
      for (const book of books) {
        await bookRepository.create(book)
      }
    })

    return collection
  },

  async delete(id: string, mode: CollectionDeleteMode): Promise<void> {
    const collection = await collectionRepository.getById(id)
    if (!collection) {
      throw new BookwormError('NOT_FOUND', 'Collection not found')
    }

    if (mode === 'keep_books') {
      await bookRepository.unlinkFromCollection(id)
      await collectionRepository.delete(id)
      return
    }

    const volumes = await bookRepository.getByCollectionId(id)
    await runCollectionTransaction(async () => {
      for (const book of volumes) {
        await readingLogRepository.deleteByBookId(book.id)
        await tagRepository.clearBookTags(book.id)
      }
      await bookRepository.deleteByCollectionId(id)
      await collectionRepository.delete(id)
    })
  },

  async isLastVolume(bookId: string): Promise<boolean> {
    const book = await bookRepository.getById(bookId)
    if (!book?.collection_id) return false
    const siblings = await bookRepository.getByCollectionId(book.collection_id)
    return siblings.length === 1
  },

  async deleteLastVolume(
    bookId: string,
    action: 'delete_collection' | 'unlink',
  ): Promise<void> {
    const book = await bookRepository.getById(bookId)
    if (!book?.collection_id) {
      await bookRepository.delete(bookId)
      return
    }

    const collectionId = book.collection_id

    if (action === 'unlink') {
      await runCollectionTransaction(async () => {
        await bookRepository.update(bookId, {
          collection_id: null,
          volume_number: null,
        })
        await collectionRepository.delete(collectionId)
      })
      return
    }

    await this.delete(collectionId, 'delete_all')
  },
}

function buildVolumeBook(
  collection: Collection,
  vol: CreateVolumeInput,
  index: number,
  now: string,
): Book {
  const isNumbered = collection.volume_mode === 'numbered'
  const volumeNumber = isNumbered
    ? (vol.volume_number ?? index + 1)
    : (vol.volume_number ?? null)

  return {
    id: generateId(),
    collection_id: collection.id,
    volume_number: volumeNumber,
    title: isNumbered ? collection.name : vol.title.trim(),
    author: collection.author,
    format: vol.format ?? 'physical',
    status: vol.status ?? 'want_to_read',
    cover_url: collection.cover_url,
    isbn: null,
    published_year: null,
    total_pages: vol.total_pages ?? null,
    total_duration_minutes: vol.total_duration_minutes ?? null,
    current_progress: 0,
    notes: '',
    started_at: null,
    finished_at: null,
    created_at: now,
    updated_at: now,
  }
}

async function runCollectionTransaction(fn: () => Promise<void>): Promise<void> {
  if (isSupabaseEnabled()) {
    await fn()
    return
  }
  await db.transaction('rw', db.books, db.collections, db.readingLog, db.book_tags, async () => {
    await fn()
  })
}