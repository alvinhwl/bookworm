import Dexie, { type Table } from 'dexie'
import type { Book, Collection, ReadingLogEntry, Tag, UserSettings } from '@/types'

export interface BookTag {
  book_id: string
  tag_id: string
}

export class BookwormDB extends Dexie {
  books!: Table<Book, string>
  readingLog!: Table<ReadingLogEntry, string>
  settings!: Table<UserSettings, string>
  collections!: Table<Collection, string>
  tags!: Table<Tag, string>
  book_tags!: Table<BookTag, [string, string]>

  constructor(name = 'bookworm') {
    super(name)

    this.version(1).stores({
      books: 'id, title, author, status, format, created_at, updated_at, finished_at',
      readingLog: 'id, book_id, logged_at, [book_id+logged_at]',
      settings: 'id',
    })

    this.version(2).stores({
      books:
        'id, title, author, status, format, collection_id, created_at, updated_at, finished_at',
      readingLog: 'id, book_id, logged_at, [book_id+logged_at]',
      settings: 'id',
      collections: 'id, name, author, created_at',
      tags: 'id, name',
      book_tags: '[book_id+tag_id], book_id, tag_id',
    })
  }
}