import type {
  Book,
  Collection,
  ReadingLogEntry,
  ReadingStatus,
  Tag,
  UserSettings,
} from '@/types'

export interface BookRepository {
  getAll(): Promise<Book[]>
  getById(id: string): Promise<Book | undefined>
  getByCollectionId(collectionId: string): Promise<Book[]>
  unlinkFromCollection(collectionId: string): Promise<void>
  deleteByCollectionId(collectionId: string): Promise<void>
  create(book: Book): Promise<string>
  update(id: string, changes: Partial<Book>): Promise<void>
  delete(id: string): Promise<void>
  countByStatus(status: ReadingStatus): Promise<number>
  getCurrentlyReading(): Promise<Book[]>
  bulkPut(books: Book[]): Promise<void>
  clear(): Promise<void>
}

export interface CollectionRepository {
  getAll(): Promise<Collection[]>
  getById(id: string): Promise<Collection | undefined>
  create(collection: Collection): Promise<string>
  update(id: string, changes: Partial<Collection>): Promise<void>
  delete(id: string): Promise<void>
  clear(): Promise<void>
}

export interface TagRepository {
  getAll(): Promise<Tag[]>
  getByBookId(bookId: string): Promise<Tag[]>
  findOrCreateByNames(names: string[]): Promise<Tag[]>
  setBookTags(bookId: string, tagNames: string[]): Promise<Tag[]>
  clearBookTags(bookId: string): Promise<void>
  deleteOrphanTags(): Promise<void>
}

export interface ReadingLogRepository {
  getByBookId(bookId: string, limit?: number): Promise<ReadingLogEntry[]>
  create(entry: ReadingLogEntry): Promise<string>
  deleteByBookId(bookId: string): Promise<void>
  bulkPut(entries: ReadingLogEntry[]): Promise<void>
  getAll(): Promise<ReadingLogEntry[]>
  clear(): Promise<void>
}

export interface SettingsRepository {
  get(): Promise<UserSettings>
  save(settings: UserSettings): Promise<void>
  clear(): Promise<void>
}