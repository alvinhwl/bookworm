import Dexie, { type Table } from 'dexie'
import type { Book, ReadingLogEntry, UserSettings } from '@/types'

export class BookwormDB extends Dexie {
  books!: Table<Book, string>
  readingLog!: Table<ReadingLogEntry, string>
  settings!: Table<UserSettings, string>

  constructor(name = 'bookworm') {
    super(name)

    this.version(1).stores({
      books: 'id, title, author, status, format, created_at, updated_at, finished_at',
      readingLog: 'id, book_id, logged_at, [book_id+logged_at]',
      settings: 'id',
    })
  }
}