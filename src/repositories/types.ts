import type { Book, ReadingLogEntry, ReadingStatus, UserSettings } from '@/types'

export interface BookRepository {
  getAll(): Promise<Book[]>
  getById(id: string): Promise<Book | undefined>
  create(book: Book): Promise<string>
  update(id: string, changes: Partial<Book>): Promise<void>
  delete(id: string): Promise<void>
  countByStatus(status: ReadingStatus): Promise<number>
  getCurrentlyReading(): Promise<Book[]>
  bulkPut(books: Book[]): Promise<void>
  clear(): Promise<void>
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